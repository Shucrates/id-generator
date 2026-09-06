import React, { useRef, useEffect, useState } from 'react';
import { renderCardCanvas } from '../utils/canvasRenderer';
import { loadImage, drawRoundedRect } from '../utils/imageUtils';
import { Pencil, Check, X, Link as LinkIcon, FileText, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { playRetroClickSound } from '../utils/soundUtils';
import SignatureModal from './SignatureModal';

function PixelScissorsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#1d19ea]">
      <path d="M6 2a4 4 0 0 0-4 4 4 4 0 0 0 3.1 3.9L9.5 12l-4.4 2.1A4 4 0 0 0 2 18a4 4 0 0 0 4 4 4 4 0 0 0 3.9-3.1L12 14.5l6 6h4v-2l-6-6 6-6V4h-4l-6 6-2.1-4.4A4 4 0 0 0 6 2zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
    </svg>
  );
}

const MUHAMMAD_VARIANTS = new Set([
  'muhammad',
  'muhammed',
  'muhamad',
  'mohammad',
  'mohammed',
  'mahammad',
  'mohamad',
  'mohamed'
]);

export default function DualCardView({
  template,
  userData,
  setUserData,
  croppedPhotoUrl,
  onOpenCropModal,
  isCustomMode,
  backVersion = 'oscorp-symbol',
  setBackVersion,
  showCuttingGuides = false,
  setShowCuttingGuides,
  applyTvaFilter = true,
  setApplyTvaFilter,
  tvaFilterIntensity = 45,
  setTvaFilterIntensity,
  isDownloaded = false
}) {
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const dragTimeoutRef = useRef(null);
  const previousFieldValueRef = useRef({});

  // Field editing state
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isCustomPdf417, setIsCustomPdf417] = useState(false);
  const [isPdf417ModalOpen, setIsPdf417ModalOpen] = useState(false);
  const [tempPdf417Url, setTempPdf417Url] = useState('');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isEditAllDrawerOpen, setIsEditAllDrawerOpen] = useState(false);

  const isLandscape = (template.cardWidth || 1515) > (template.cardHeight || 2400);

  // Live Canvas Rendering for Front and Back side-by-side
  useEffect(() => {
    let isCancelled = false;

    async function updateCanvases() {
      try {
        if (frontCanvasRef.current) {
          await renderCardCanvas({
            canvas: frontCanvasRef.current,
            template,
            userData,
            croppedPhotoUrl,
            side: 'front',
            scale: 0.8,
            isCustomMode,
            isEditingName: editingField === 'name',
            editingField,
            backVersion,
            showCuttingGuides,
            applyTvaFilter,
            tvaFilterIntensity
          });
        }

        if (backCanvasRef.current && template.hasBackSide) {
          await renderCardCanvas({
            canvas: backCanvasRef.current,
            template,
            userData,
            croppedPhotoUrl,
            side: 'back',
            scale: 0.8,
            isCustomMode,
            backVersion,
            showCuttingGuides
          });
        }
      } catch (err) {
        console.error("Canvas render error:", err);
      }
    }

    const timer = setTimeout(updateCanvases, 40);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [template, userData, croppedPhotoUrl, isCustomMode, editingField, backVersion, showCuttingGuides, applyTvaFilter, tvaFilterIntensity]);

  // Live Mini Canvas Floating Preview for TVA
  useEffect(() => {
    if (!isDraggingSlider || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let activeSrc = croppedPhotoUrl || (template.id === 'loki-tva-id' ? '/tva-loki-default-front.png?v=2' : null);
    if (!activeSrc) return;

    let isSubscribed = true;

    loadImage(activeSrc).then((img) => {
      if (!img || !isSubscribed || !previewCanvasRef.current) return;
      const pw = 120, ph = 155;
      canvas.width = pw;
      canvas.height = ph;
      ctx.clearRect(0, 0, pw, ph);

      const radius = { topLeft: 18, topRight: 15, bottomRight: 6, bottomLeft: 6 };

      ctx.save();
      drawRoundedRect(ctx, 0, 0, pw, ph, radius);
      ctx.clip();

      const intensityFactor = applyTvaFilter ? (Math.min(Math.max(tvaFilterIntensity, 0), 100) / 100) : 0;

      if (intensityFactor > 0) {
        try {
          const sepiaVal = (0.18 * intensityFactor).toFixed(2);
          const satVal = (1 - 0.15 * intensityFactor).toFixed(2);
          const contrastVal = (1 + 0.10 * intensityFactor).toFixed(2);
          const brightVal = (1 - 0.05 * intensityFactor).toFixed(2);

          ctx.filter = `sepia(${sepiaVal}) saturate(${satVal}) contrast(${contrastVal}) brightness(${brightVal})`;
        } catch (e) {}
      }

      const imgRatio = img.width / img.height;
      const targetRatio = pw / ph;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (imgRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, pw, ph);
      ctx.restore();
    });

    return () => {
      isSubscribed = false;
    };
  }, [isDraggingSlider, tvaFilterIntensity, croppedPhotoUrl, applyTvaFilter, template.id]);

  const handleFieldClick = (fieldKey) => {
    playRetroClickSound();

    if (fieldKey === 'photo') {
      if (!isCustomMode) return;
      const fileInput = document.getElementById('wireframe-file-input');
      if (fileInput) fileInput.click();
      return;
    }

    if (fieldKey === 'signature') {
      if (!isCustomMode) return;
      setIsSignatureModalOpen(true);
      return;
    }

    if (fieldKey === 'pdf417Url') {
      setTempPdf417Url(userData.pdf417Url || template.defaultValues?.pdf417Url || 'https://id.patilshubham.me');
      setIsPdf417ModalOpen(true);
      return;
    }

    if (!isCustomMode) return;

    // Save previous value so if user blurs without typing, we can safely restore
    const currentVal = userData[fieldKey] !== undefined && userData[fieldKey] !== null ? userData[fieldKey] : template.defaultValues?.[fieldKey] || '';
    previousFieldValueRef.current[fieldKey] = currentVal;

    // Check if field currently holds the initial default value
    const isDefault = !userData[fieldKey] || (template.defaultValues && userData[fieldKey] === template.defaultValues[fieldKey]);

    // Only start empty if editing the default value; keep custom values for editing
    if (isDefault) {
      setUserData((prev) => ({ ...prev, [fieldKey]: '' }));
    }

    setEditingField(fieldKey);
  };

  const handleFinishEditing = (fieldKey) => {
    setUserData((prev) => {
      const currentVal = prev[fieldKey];
      if (currentVal === undefined || currentVal === null || currentVal.toString().trim() === '') {
        const fallback = previousFieldValueRef.current[fieldKey] || template.defaultValues?.[fieldKey] || '';
        return { ...prev, [fieldKey]: fallback };
      }
      return prev;
    });
    setEditingField(null);
  };

  // Auto-formats MM/DD/YYYY dates with auto-slash insertion and max 8 digits
  const handleDateChange = (field, e) => {
    const inputVal = e.target.value;
    const isDelete = e.nativeEvent?.inputType === 'deleteContentBackward';
    const digits = inputVal.replace(/\D/g, '').substring(0, 8);

    let formatted = '';
    if (digits.length === 0) {
      formatted = '';
    } else if (digits.length < 2) {
      formatted = digits;
    } else if (digits.length === 2) {
      formatted = isDelete ? digits : `${digits}/`;
    } else if (digits.length < 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length === 4) {
      formatted = isDelete ? `${digits.slice(0, 2)}/${digits.slice(2)}` : `${digits.slice(0, 2)}/${digits.slice(2)}/`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    setUserData((prev) => ({ ...prev, [field]: formatted }));
  };

  // Auto-formats NN-NN-NNNNN license numbers with auto-dash insertion and max 9 digits
  const handleLicenseNumberChange = (e) => {
    const inputVal = e.target.value;
    const isDelete = e.nativeEvent?.inputType === 'deleteContentBackward';
    const digits = inputVal.replace(/\D/g, '').substring(0, 9);

    let formatted = '';
    if (digits.length === 0) {
      formatted = '';
    } else if (digits.length < 2) {
      formatted = digits;
    } else if (digits.length === 2) {
      formatted = isDelete ? digits : `${digits}-`;
    } else if (digits.length < 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else if (digits.length === 4) {
      formatted = isDelete ? `${digits.slice(0, 2)}-${digits.slice(2)}` : `${digits.slice(0, 2)}-${digits.slice(2)}-`;
    } else {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
    }

    setUserData((prev) => ({ ...prev, licenseNumber: formatted }));
  };



  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onOpenCropModal(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Percentages for overlay hotspots based on template base dimensions
  const getPercentStyle = (x, y, width, height) => {
    const baseW = template.cardWidth || 1515;
    const baseH = template.cardHeight || 2400;
    return {
      left: `${(x / baseW) * 100}%`,
      top: `${(y / baseH) * 100}%`,
      width: `${(width / baseW) * 100}%`,
      height: `${(height / baseH) * 100}%`
    };
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto font-sans">
      {/* Hidden File Input */}
      <input
        id="wireframe-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Side-by-Side Cards Grid */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full py-1">
        {/* FRONT CARD CONTAINER */}
        <div
          className={`relative @container ${
            isLandscape
              ? 'w-[375px] xs:w-[412px] sm:w-[450px] md:w-[490px] lg:w-[550px] rounded-2xl'
              : 'w-[260px] xs:w-[290px] sm:w-[270px] md:w-[300px] rounded-3xl'
          } overflow-hidden card-shadow border border-slate-300 bg-white shrink-0`}
          style={{
            aspectRatio: `${template.cardWidth || 1515} / ${template.cardHeight || 2400}`,
            containerType: 'inline-size'
          }}
        >
          <canvas
            ref={frontCanvasRef}
            className="w-full h-full object-contain block"
          />

          {/* Hotspots for Front Card in Customizer Mode */}
          {isCustomMode && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {template.id === 'loki-tva-id' ? (
                /* Photo Box for Loki TVA Card */
                <div
                  style={getPercentStyle(366, 1097, 783, 1010)}
                  onClick={() => handleFieldClick('photo')}
                  className="absolute on-card-field-hover-white flex items-center justify-center group cursor-pointer"
                  title="Upload Image"
                />
              ) : template.id === 'mclovin-license' ? (
                /* McLovin License Front Hotspots */
                <>
                  {/* Photo Box */}
                  <div
                    style={getPercentStyle(24, 24, 314, 354)}
                    onClick={() => handleFieldClick('photo')}
                    className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                    title="Upload Photo"
                  />

                  {/* License Number */}
                  {editingField === 'licenseNumber' ? (
                    <div style={getPercentStyle(477, 120, 360, 58)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={11}
                        value={userData.licenseNumber || ''}
                        onChange={handleLicenseNumberChange}
                        onBlur={() => handleFinishEditing('licenseNumber')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('licenseNumber')}
                        style={{
                          fontFamily: "'Open Sans Condensed', 'Open Sans', sans-serif",
                          fontWeight: 750,
                          fontSize: '4.64cqw',
                          letterSpacing: '0.12cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="01-47-87441"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(474, 126, 252, 52)}
                      onClick={() => handleFieldClick('licenseNumber')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit License Number"
                    />
                  )}

                  {/* DOB */}
                  {editingField === 'dob' ? (
                    <div style={getPercentStyle(422, 185, 300, 58)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={10}
                        value={userData.dob || ''}
                        onChange={(e) => handleDateChange('dob', e)}
                        onBlur={() => handleFinishEditing('dob')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('dob')}
                        style={{
                          fontFamily: "'Open Sans Condensed', 'Open Sans', sans-serif",
                          fontWeight: 750,
                          fontSize: '4.69cqw',
                          letterSpacing: '0.1cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="06/03/1981"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(416, 192, 222, 52)}
                      onClick={() => handleFieldClick('dob')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Date of Birth"
                    />
                  )}

                  {/* EXP */}
                  {editingField === 'exp' ? (
                    <div style={getPercentStyle(735, 185, 280, 58)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={10}
                        value={userData.exp || ''}
                        onChange={(e) => handleDateChange('exp', e)}
                        onBlur={() => handleFinishEditing('exp')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('exp')}
                        style={{
                          fontFamily: "'Open Sans Condensed', 'Open Sans', sans-serif",
                          fontWeight: 750,
                          fontSize: '4.69cqw',
                          letterSpacing: '0.1cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="06/03/2008"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(731, 192, 226, 52)}
                      onClick={() => handleFieldClick('exp')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Expiration Date"
                    />
                  )}

                  {/* HT */}
                  {editingField === 'ht' ? (
                    <div style={getPercentStyle(361, 271, 100, 32)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={6}
                        value={userData.ht || ''}
                        onChange={(e) => {
                          const val = e.target.value.substring(0, 6);
                          setUserData((prev) => ({ ...prev, ht: val }));
                        }}
                        onBlur={() => handleFinishEditing('ht')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('ht')}
                        style={{
                          fontFamily: "'Open Sans', 'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '2.34cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="5-10"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(358, 274, 58, 26)}
                      onClick={() => handleFieldClick('ht')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Height (Ft-In)"
                    />
                  )}

                  {/* WT */}
                  {editingField === 'wt' ? (
                    <div style={getPercentStyle(468, 271, 120, 32)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={7}
                        value={userData.wt || ''}
                        onChange={(e) => {
                          const val = e.target.value.substring(0, 7);
                          setUserData((prev) => ({ ...prev, wt: val }));
                        }}
                        onBlur={() => handleFinishEditing('wt')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('wt')}
                        style={{
                          fontFamily: "'Open Sans', 'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '2.34cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="150"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(466, 274, 58, 26)}
                      onClick={() => handleFieldClick('wt')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Weight (Lbs)"
                    />
                  )}

                  {/* HAIR */}
                  {editingField === 'hair' ? (
                    <div style={getPercentStyle(573, 271, 105, 32)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={12}
                        value={userData.hair || ''}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setUserData((prev) => ({ ...prev, hair: val }));
                        }}
                        onBlur={() => handleFinishEditing('hair')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('hair')}
                        style={{
                          fontFamily: "'Open Sans', 'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '2.34cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 uppercase leading-none cursor-text"
                        placeholder="BRO"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(571, 274, 56, 26)}
                      onClick={() => handleFieldClick('hair')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Hair Color"
                    />
                  )}

                  {/* EYES */}
                  {editingField === 'eyes' ? (
                    <div style={getPercentStyle(689, 271, 105, 32)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={12}
                        value={userData.eyes || ''}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setUserData((prev) => ({ ...prev, eyes: val }));
                        }}
                        onBlur={() => handleFinishEditing('eyes')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('eyes')}
                        style={{
                          fontFamily: "'Open Sans', 'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '2.34cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 uppercase leading-none cursor-text"
                        placeholder="BRO"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(687, 274, 56, 26)}
                      onClick={() => handleFieldClick('eyes')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Eye Color"
                    />
                  )}

                  {/* SEX */}
                  {editingField === 'sex' ? (
                    <div style={getPercentStyle(771, 271, 110, 32)} className="absolute z-20 flex items-center justify-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={4}
                        value={userData.sex || ''}
                        onChange={(e) => {
                          const val = e.target.value.substring(0, 4).toUpperCase();
                          setUserData((prev) => ({ ...prev, sex: val }));
                        }}
                        onBlur={() => handleFinishEditing('sex')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('sex')}
                        style={{
                          fontFamily: "'Open Sans', 'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '2.34cqw',
                          color: '#1A1A1A',
                          textAlign: 'center'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 uppercase leading-none cursor-text text-center"
                        placeholder="M"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(805, 274, 42, 26)}
                      onClick={() => handleFieldClick('sex')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Sex"
                    />
                  )}

                  {/* CTY */}
                  {editingField === 'cty' ? (
                    <div style={getPercentStyle(916, 271, 55, 32)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={1}
                        value={userData.cty ?? ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').substring(0, 1);
                          setUserData((prev) => ({ ...prev, cty: val }));
                        }}
                        onBlur={() => handleFinishEditing('cty')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('cty')}
                        style={{
                          fontFamily: "'Open Sans', 'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '2.34cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="0"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(912, 274, 28, 26)}
                      onClick={() => handleFieldClick('cty')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit County digit (0-9)"
                    />
                  )}

                  {/* ISSUE DATE */}
                  {editingField === 'issueDate' ? (
                    <div style={getPercentStyle(362, 352, 210, 32)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={10}
                        value={userData.issueDate || ''}
                        onChange={(e) => handleDateChange('issueDate', e)}
                        onBlur={() => handleFinishEditing('issueDate')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('issueDate')}
                        style={{
                          fontFamily: "'Open Sans', 'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '2.29cqw',
                          letterSpacing: '0.07cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="06/18/1998"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(358, 355, 155, 26)}
                      onClick={() => handleFieldClick('issueDate')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Issue Date"
                    />
                  )}

                  {/* CLASS */}
                  {editingField === 'class' ? (
                    <div style={getPercentStyle(578, 352, 90, 32)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        maxLength={3}
                        value={userData.class || ''}
                        onChange={(e) => setUserData((prev) => ({ ...prev, class: e.target.value }))}
                        onBlur={() => handleFinishEditing('class')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('class')}
                        style={{
                          fontFamily: "'Open Sans', 'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '2.29cqw',
                          letterSpacing: '0.07cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="3"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(571, 355, 36, 26)}
                      onClick={() => handleFieldClick('class')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Class"
                    />
                  )}

                  {/* SIGNATURE */}
                  <div
                    style={getPercentStyle(400, 398, 190, 80)}
                    onClick={() => handleFieldClick('signature')}
                    className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                    title="Click to sign card"
                  />

                  {/* NAME */}
                  {editingField === 'name' ? (
                    <div style={getPercentStyle(25, 492, 460, 42)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        value={userData.name || ''}
                        onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                        onBlur={() => handleFinishEditing('name')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('name')}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '3.22cqw',
                          letterSpacing: '-0.06cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="McLOVIN"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(20, 494, 430, 36)}
                      onClick={() => handleFieldClick('name')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Name"
                    />
                  )}

                  {/* ADDRESS 1 (Street) */}
                  {editingField === 'address1' ? (
                    <div style={getPercentStyle(25, 531, 460, 42)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        value={userData.address1 || ''}
                        onChange={(e) => setUserData((prev) => ({ ...prev, address1: e.target.value }))}
                        onBlur={() => handleFinishEditing('address1')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('address1')}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '3.22cqw',
                          letterSpacing: '-0.06cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="892 MOMONA ST"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(20, 533, 430, 36)}
                      onClick={() => handleFieldClick('address1')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit Street Address"
                    />
                  )}

                  {/* ADDRESS 2 (City, State Zip) */}
                  {editingField === 'address2' ? (
                    <div style={getPercentStyle(25, 570, 460, 42)} className="absolute z-20 flex items-center">
                      <input
                        type="text"
                        autoFocus
                        value={userData.address2 || ''}
                        onChange={(e) => setUserData((prev) => ({ ...prev, address2: e.target.value }))}
                        onBlur={() => handleFinishEditing('address2')}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing('address2')}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 750,
                          fontSize: '3.22cqw',
                          letterSpacing: '-0.06cqw',
                          color: '#1A1A1A'
                        }}
                        className="w-full h-full bg-transparent border-none outline-none focus:outline-none p-0 m-0 leading-none cursor-text"
                        placeholder="HONOLULU, HI 96820"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(20, 572, 430, 36)}
                      onClick={() => handleFieldClick('address2')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit City, State Zip"
                    />
                  )}
                </>
              ) : (
                /* Oscorp Photo & Name Hotspots */
                <>
                  <div
                    style={getPercentStyle(401, 910, 752, 940)}
                    onClick={() => handleFieldClick('photo')}
                    className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                    title="Upload Image"
                  />

                  {editingField === 'name' ? (
                    <div
                      style={getPercentStyle(200, 1955, 1115, 110)}
                      className="absolute z-20 flex items-center justify-center bg-transparent"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => {
                          setTempValue(e.target.value);
                          setUserData((prev) => ({ ...prev, name: e.target.value }));
                        }}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                        placeholder="Add your name"
                        style={{
                          fontFamily: "'Baskerville', 'Baskerville Old Face', 'Georgia', serif",
                          fontWeight: 600,
                          fontSize: 'clamp(12px, 3.8vw, 22px)'
                        }}
                        className="w-full text-center bg-transparent text-slate-900 focus:outline-none border-none p-0 m-0 leading-tight placeholder:opacity-35"
                      />
                    </div>
                  ) : (
                    <div
                      style={getPercentStyle(200, 1965, 1115, 110)}
                      onClick={() => handleFieldClick('name')}
                      className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                      title="Click to edit name"
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* BACK CARD CONTAINER */}
        <div
          className={`relative ${
            isLandscape
              ? 'w-[375px] xs:w-[412px] sm:w-[450px] md:w-[490px] lg:w-[550px] rounded-2xl'
              : 'w-[260px] xs:w-[290px] sm:w-[270px] md:w-[300px] rounded-3xl'
          } overflow-hidden card-shadow border border-slate-300 bg-white shrink-0`}
          style={{ aspectRatio: `${template.cardWidth || 1515} / ${template.cardHeight || 2400}` }}
        >
          <canvas
            ref={backCanvasRef}
            className="w-full h-full object-contain block"
          />

          {/* Hotspots on Back Card for McLovin License */}
          {template.id === 'mclovin-license' && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {/* Mini Photo Hotspot */}
              <div
                style={getPercentStyle(137, 504, 99, 113)}
                onClick={() => handleFieldClick('photo')}
                className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                title="Upload Photo"
              />

              {/* PDF417 Barcode Hotspot */}
              <div
                style={getPercentStyle(246, 194, 568, 204)}
                onClick={() => handleFieldClick('pdf417Url')}
                className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                title="Click to edit PDF417 Barcode URL"
              />
            </div>
          )}

          {/* Hotspot for QR Code on Back Card for Oscorp */}
          {template.id === 'oscorp-staff' && backVersion === 'custom-qr' && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <div
                style={getPercentStyle(800, 1460, 420, 420)}
                onClick={() => handleFieldClick('qrUrl')}
                className="absolute on-card-field-hover flex items-center justify-center group cursor-pointer"
                title="Click to edit QR Code URL"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── TVA VINTAGE FILTER TOGGLE & INTENSITY SLIDER ── */}
      {template.id === 'loki-tva-id' && isCustomMode && (
        <div className="relative w-full max-w-[600px] mx-auto mt-4 mb-1 px-4 flex flex-col items-center justify-center gap-2 select-none shrink-0 font-sans">
          {applyTvaFilter && isDraggingSlider && (
            <div
              className="sm:hidden absolute -top-[182px] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center p-1.5 rounded-2xl bg-slate-900/95 text-white border-2 border-amber-500/80 shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-none"
              style={{ width: '132px' }}
            >
              <div className="w-[120px] h-[155px] rounded-xl overflow-hidden bg-black/50 border border-amber-500/40 relative shadow-inner">
                <canvas ref={previewCanvasRef} className="w-full h-full object-contain block" />
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-slate-900/95" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <label
              className="text-[17px] font-bold text-[#1d19ea] flex items-center gap-2 leading-none cursor-pointer"
              onClick={() => {
                playRetroClickSound();
                if (setApplyTvaFilter) setApplyTvaFilter(!applyTvaFilter);
              }}
              style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
            >
              apply image filter
            </label>

            {/* Retro 3D Toggle Switch */}
            <div
              onClick={() => {
                playRetroClickSound();
                if (setApplyTvaFilter) setApplyTvaFilter(!applyTvaFilter);
              }}
              className="relative w-14 h-7 rounded-full cursor-pointer transition-all flex items-center px-0.5 shrink-0"
              style={{
                background: applyTvaFilter
                  ? 'linear-gradient(180deg, #b8c1ef 0%, #909ce0 100%)'
                  : 'linear-gradient(180deg, #dfdfdf 0%, #c0c0c0 100%)',
                boxShadow: 'inset 1px 1px 2px #505050, inset -1px -1px 2px #ffffff, 0 0 0 1px #000000',
              }}
              title="Toggle TVA retro sepia/greenish photo filter"
            >
              <div
                className={`w-6 h-6 rounded-full transition-transform duration-200 ${
                  applyTvaFilter ? 'translate-x-6' : 'translate-x-0'
                }`}
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #d8d8d8 100%)',
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.4), inset 1px 1px 1px #ffffff',
                  border: '1px solid #707070',
                }}
              />
            </div>
          </div>

          {/* Intensity Slider Bar */}
          {applyTvaFilter && (
            <div className="flex items-center justify-center gap-3 mt-1 w-full max-w-xs transition-opacity duration-200">
              <span
                className="text-[14px] font-bold text-slate-700 whitespace-nowrap"
                style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
              >
                filter intensity:
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={tvaFilterIntensity}
                onMouseDown={() => {
                  setIsDraggingSlider(true);
                  if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
                }}
                onTouchStart={() => {
                  setIsDraggingSlider(true);
                  if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
                }}
                onMouseUp={() => {
                  if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
                  dragTimeoutRef.current = setTimeout(() => setIsDraggingSlider(false), 900);
                }}
                onTouchEnd={() => {
                  if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
                  dragTimeoutRef.current = setTimeout(() => setIsDraggingSlider(false), 900);
                }}
                onChange={(e) => {
                  setIsDraggingSlider(true);
                  if (setTvaFilterIntensity) setTvaFilterIntensity(Number(e.target.value));
                  if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
                  dragTimeoutRef.current = setTimeout(() => setIsDraggingSlider(false), 900);
                }}
                className="w-36 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#1d19ea]"
                title="Adjust filter intensity"
              />
              <span
                className="text-[14px] font-extrabold text-[#1d19ea] min-w-[36px] text-right font-mono"
              >
                {tvaFilterIntensity}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── MCLOVIN LICENSE TOGGLES & QUICK CONTROLS ── */}
      {template.id === 'mclovin-license' && (
        <div className="w-full max-w-[600px] mx-auto my-2 px-4 flex flex-col items-center justify-center gap-2 select-none shrink-0 font-sans">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {/* Custom PDF417 Toggle */}
            <div className="flex items-center gap-2.5">
              <label
                className="text-[16px] font-bold text-[#1d19ea] flex items-center gap-1.5 leading-none cursor-pointer"
                onClick={() => {
                  playRetroClickSound();
                  setIsCustomPdf417(!isCustomPdf417);
                }}
                style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
              >
                <img
                  src="/pixel-qr-icon.png"
                  alt="Custom PDF417 Icon"
                  className="w-[22px] h-[22px] object-contain shrink-0 select-none pointer-events-none"
                /> custom pdf417
              </label>

              {/* 3D Retro Bevel Pill Toggle Switch */}
              <div
                onClick={() => {
                  playRetroClickSound();
                  setIsCustomPdf417(!isCustomPdf417);
                }}
                className="relative w-12 h-6 rounded-full cursor-pointer transition-all flex items-center px-0.5 shrink-0"
                style={{
                  background: isCustomPdf417
                    ? 'linear-gradient(180deg, #b8c1ef 0%, #909ce0 100%)'
                    : 'linear-gradient(180deg, #dfdfdf 0%, #c0c0c0 100%)',
                  boxShadow: 'inset 1px 1px 2px #505050, inset -1px -1px 2px #ffffff, 0 0 0 1px #000000',
                }}
                title="Toggle custom PDF417 barcode"
              >
                <div
                  className="w-5 h-5 rounded-full transition-transform duration-200"
                  style={{
                    transform: isCustomPdf417 ? 'translateX(24px)' : 'translateX(0px)',
                    background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
                    boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px -1px 1px #505050, 0 0 0 1px #000000',
                  }}
                />
              </div>
            </div>

          </div>

          {/* Sunken Windows 98 Style Text Input for PDF417 URL (Appears when custom pdf417 is turned ON) */}
          {isCustomPdf417 && (
            <div className="w-full max-w-sm mt-1 transition-all animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#1d19ea] shrink-0" />
                <input
                  type="text"
                  value={userData.pdf417Url || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserData((prev) => ({ ...prev, pdf417Url: val }));
                  }}
                  placeholder="https://id.patilshubham.me"
                  className="w-full px-3 py-1.5 text-[13px] text-slate-900 focus:outline-none placeholder:text-slate-400"
                  style={{
                    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
                    backgroundColor: '#ffffff',
                    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 0px #ffffff, 0 0 0 1px #707070',
                  }}
                />
              </div>
            </div>
          )}

          {/* Muhammad Easter Egg Fun Fact */}
          {userData?.name && MUHAMMAD_VARIANTS.has(userData.name.trim().toLowerCase()) && (
            <p
              className="text-[clamp(14px,1.6vw,18px)] font-normal text-[#1d19ea] tracking-tight leading-none mt-1 transition-all duration-300 text-center"
              style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
            >
              fun fact: most commonly used name on earth according to fogell
            </p>
          )}
        </div>
      )}

      {/* ── SIMPLE CLEAN TOGGLES (Only shown for Oscorp card) ── */}
      {template.id === 'oscorp-staff' && (
        <div className="w-full max-w-[600px] mx-auto my-3 px-4 flex flex-col items-center justify-center gap-2.5 select-none shrink-0 font-sans">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-14">
            {/* 1. CUTTING LINES TOGGLE */}
            <div className="flex items-center gap-2.5">
              <label
                className="text-[17px] font-bold text-[#1d19ea] flex items-center gap-1.5 leading-none cursor-pointer"
                onClick={() => {
                  playRetroClickSound();
                  if (setShowCuttingGuides) setShowCuttingGuides(!showCuttingGuides);
                }}
                style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
              >
                <PixelScissorsIcon /> cutting lines
              </label>

              <div
                onClick={() => {
                  playRetroClickSound();
                  if (setShowCuttingGuides) setShowCuttingGuides(!showCuttingGuides);
                }}
                className="relative w-14 h-7 rounded-full cursor-pointer transition-all flex items-center px-0.5 shrink-0"
                style={{
                  background: showCuttingGuides
                    ? 'linear-gradient(180deg, #b8c1ef 0%, #909ce0 100%)'
                    : 'linear-gradient(180deg, #dfdfdf 0%, #c0c0c0 100%)',
                  boxShadow: 'inset 1px 1px 2px #505050, inset -1px -1px 2px #ffffff, 0 0 0 1px #000000',
                }}
                title="Toggle cutting notch lines"
              >
                <div
                  className="w-6 h-6 rounded-full transition-transform duration-200"
                  style={{
                    transform: showCuttingGuides ? 'translateX(26px)' : 'translateX(0px)',
                    background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
                    boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px -1px 1px #505050, 0 0 0 1px #000000',
                  }}
                />
              </div>
            </div>

            {/* 2. SIMPLE CUSTOM QR TOGGLE */}
            <div className="flex items-center gap-2.5">
              <label
                className="text-[17px] font-bold text-[#1d19ea] flex items-center gap-1.5 leading-none cursor-pointer"
                onClick={() => {
                  playRetroClickSound();
                  const nextVersion = backVersion === 'custom-qr' ? 'oscorp-symbol' : 'custom-qr';
                  if (setBackVersion) setBackVersion(nextVersion);
                }}
                style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
              >
                <img
                  src="/pixel-qr-icon.png"
                  alt="Custom QR Icon"
                  className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] object-contain shrink-0 select-none pointer-events-none"
                /> custom qr
              </label>

              <div
                onClick={() => {
                  playRetroClickSound();
                  const nextVersion = backVersion === 'custom-qr' ? 'oscorp-symbol' : 'custom-qr';
                  if (setBackVersion) setBackVersion(nextVersion);
                }}
                className="relative w-14 h-7 rounded-full cursor-pointer transition-all flex items-center px-0.5 shrink-0"
                style={{
                  background: backVersion === 'custom-qr'
                    ? 'linear-gradient(180deg, #b8c1ef 0%, #909ce0 100%)'
                    : 'linear-gradient(180deg, #dfdfdf 0%, #c0c0c0 100%)',
                  boxShadow: 'inset 1px 1px 2px #505050, inset -1px -1px 2px #ffffff, 0 0 0 1px #000000',
                }}
                title="Toggle custom QR code"
              >
                <div
                  className="w-6 h-6 rounded-full transition-transform duration-200"
                  style={{
                    transform: backVersion === 'custom-qr' ? 'translateX(26px)' : 'translateX(0px)',
                    background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
                    boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px -1px 1px #505050, 0 0 0 1px #000000',
                  }}
                />
              </div>
            </div>
          </div>

          {backVersion === 'custom-qr' && (
            <div className="w-full max-w-sm mt-1 transition-all animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#1d19ea] shrink-0" />
                <input
                  type="text"
                  value={userData.qrUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserData((prev) => ({ ...prev, qrUrl: val }));
                  }}
                  placeholder="paste your link here"
                  className="w-full px-3 py-1.5 text-[13px] text-slate-900 focus:outline-none placeholder:text-slate-400"
                  style={{
                    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
                    backgroundColor: '#ffffff',
                    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 0px #ffffff, 0 0 0 1px #707070',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}



      {/* ── PLAIN MINIMALIST WHITE PROMPT BOX FOR PDF417 ── */}
      {isPdf417ModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 font-sans"
          onClick={() => setIsPdf417ModalOpen(false)}
        >
          <div
            className="flex flex-col gap-2 w-full max-w-[280px]"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              autoFocus
              value={tempPdf417Url}
              onChange={(e) => setTempPdf417Url(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setUserData((prev) => ({ ...prev, pdf417Url: tempPdf417Url }));
                  setIsCustomPdf417(true);
                  setIsPdf417ModalOpen(false);
                }
                if (e.key === 'Escape') {
                  setIsPdf417ModalOpen(false);
                }
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #a1a1a1',
                borderRadius: '0px',
                outline: 'none',
                boxShadow: 'none',
                padding: '8px 10px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                color: '#000000',
                width: '100%',
                boxSizing: 'border-box'
              }}
              className="focus:outline-none focus:ring-0"
            />

            <button
              type="button"
              onClick={() => {
                setUserData((prev) => ({ ...prev, pdf417Url: tempPdf417Url }));
                setIsCustomPdf417(true);
                setIsPdf417ModalOpen(false);
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #a1a1a1',
                borderRadius: '0px',
                outline: 'none',
                boxShadow: 'none',
                padding: '6px 0',
                width: '100%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
              className="hover:bg-slate-50 active:bg-slate-100 transition"
              title="Apply barcode"
            >
              <Check className="w-5 h-5 text-black stroke-[2]" />
            </button>
          </div>
        </div>
      )}

      {/* ── SIGNATURE DRAWING MODAL ── */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        initialSignature={userData.signatureDataUrl}
        name={userData.name || 'McLovin'}
        onSaveSignature={(signatureDataUrl) => {
          setUserData((prev) => ({
            ...prev,
            signatureDataUrl
          }));
        }}
        onLiveUpdateSignature={(signatureDataUrl) => {
          setUserData((prev) => ({
            ...prev,
            signatureDataUrl
          }));
        }}
      />
    </div>
  );
}


