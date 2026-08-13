import React, { useRef, useEffect, useState } from 'react';
import { renderCardCanvas } from '../utils/canvasRenderer';
import { loadImage, drawRoundedRect } from '../utils/imageUtils';
import { Pencil, Check, X, Link as LinkIcon } from 'lucide-react';
import { playRetroClickSound } from '../utils/soundUtils';

function PixelScissorsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#1d19ea]">
      <path d="M6 2a4 4 0 0 0-4 4 4 4 0 0 0 3.1 3.9L9.5 12l-4.4 2.1A4 4 0 0 0 2 18a4 4 0 0 0 4 4 4 4 0 0 0 3.9-3.1L12 14.5l6 6h4v-2l-6-6 6-6V4h-4l-6 6-2.1-4.4A4 4 0 0 0 6 2zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
    </svg>
  );
}

function PixelGearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#1d19ea]">
      <path d="M9 2h6v3h-6V2zM4 9h3v6H4V9zm13 0h3v6h-3V9zm-8 13h6v-3H9v3zM2 4h4V2H2v4zm16-2v4h4V2h-4zM2 22h4v-4H2v4zm18-4v4h2v-4h-2zM8 8h8v8H8V8zm2 2v4h4v-4h-4z" />
    </svg>
  );
}

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

  const [editingField, setEditingField] = useState(null); // 'name' | 'qrUrl'
  const [tempValue, setTempValue] = useState('');
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

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
            scale: 0.8, // Fast, crisp 4x-Retina screen preview (1212 x 1920 px)
            isCustomMode,
            isEditingName: editingField === 'name',
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
            scale: 0.8, // Fast, crisp 4x-Retina screen preview (1212 x 1920 px)
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

  // Live Mini Canvas Floating Preview (Rendered when dragging intensity slider on mobile/desktop)
  useEffect(() => {
    if (!isDraggingSlider || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let activeSrc = croppedPhotoUrl || (template.id === 'loki-tva-id' ? '/tva-loki-default-front.png' : null);
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
          const grayPercent = Math.round(intensityFactor * 90);
          const blurPx = (intensityFactor * 0.2).toFixed(1);
          ctx.filter = `grayscale(${grayPercent}%) sepia(${intensityFactor * 0.8}) contrast(0.88) brightness(1.02) blur(${blurPx}px)`;
        } catch (e) {}
      }

      // Aspect cover fill
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

      if (intensityFactor > 0) {
        ctx.filter = 'none';

        // Pass 1: Soft Analog Film Bloom Overlay (Diffuses sharp edges into soft film glow)
        ctx.save();
        ctx.globalAlpha = intensityFactor * 0.28;
        try {
          const bloomBlur = Math.max(1, Math.round(1.2 * intensityFactor));
          ctx.filter = `blur(${bloomBlur}px) brightness(1.08) sepia(0.6)`;
        } catch (e) {}
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, pw, ph);
        ctx.restore();

        // Pass 2: Warm Vintage TVA Golden Orange-Yellowish Amber Tint (#ba8945)
        ctx.globalAlpha = intensityFactor * 0.72;
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = '#ba8945';
        ctx.fillRect(0, 0, pw, ph);

        // Pass 3: Soft Muted Sepia Shadow Multiply Blend
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(55, 42, 32, 0.28)';
        ctx.fillRect(0, 0, pw, ph);

        // Pass 4: Dark Radial Vintage Lens Vignette (Darkens edges & corners)
        ctx.globalAlpha = 1.0;
        const centerX = pw / 2;
        const centerY = ph / 2;
        const maxRadius = Math.max(pw, ph) * 0.72;

        const vignetteGrad = ctx.createRadialGradient(
          centerX, centerY, maxRadius * 0.25,
          centerX, centerY, maxRadius
        );
        vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGrad.addColorStop(0.55, `rgba(20, 15, 10, ${0.30 * intensityFactor})`);
        vignetteGrad.addColorStop(1, `rgba(10, 5, 0, ${0.72 * intensityFactor})`);

        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, pw, ph);

        // Reset alpha and composite blend mode
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

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

    if (fieldKey === 'name') {
      if (!isCustomMode) return;
      setEditingField('name');
      setTempValue(userData.name || '');
      return;
    }

    if (fieldKey === 'qrUrl') {
      if (backVersion !== 'custom-qr') return;
      setEditingField('qrUrl');
      setTempValue(userData.qrUrl || template.defaultValues?.qrUrl || '');
    }
  };

  const handleSaveField = () => {
    if (editingField) {
      setUserData((prev) => ({
        ...prev,
        [editingField]: tempValue
      }));
      setEditingField(null);
    }
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

  // Percentages for overlay hotspots on 1515 x 2400 base card
  const getPercentStyle = (x, y, width, height) => ({
    left: `${(x / 1515) * 100}%`,
    top: `${(y / 2400) * 100}%`,
    width: `${(width / 1515) * 100}%`,
    height: `${(height / 2400) * 100}%`
  });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto font-sans">
      {/* Hidden File Input */}
      <input
        id="wireframe-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Side-by-Side Cards Grid */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full py-1">
        {/* FRONT CARD CONTAINER */}
        <div className="relative w-[260px] xs:w-[290px] sm:w-[270px] md:w-[300px] aspect-[1515/2400] rounded-3xl overflow-hidden card-shadow border border-slate-300 bg-white shrink-0">
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
        <div className="relative w-[260px] xs:w-[290px] sm:w-[270px] md:w-[300px] aspect-[1515/2400] rounded-3xl overflow-hidden card-shadow border border-slate-300 bg-white shrink-0">
          <canvas
            ref={backCanvasRef}
            className="w-full h-full object-contain block"
          />

          {/* Hotspot for QR Code on Back Card when QR Code Back Version is active */}
          {template.id !== 'loki-tva-id' && backVersion === 'custom-qr' && (
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
          
          {/* Floating Live Photo Preview Popup (Pops up above user's finger on mobile during slider drag) */}
          {applyTvaFilter && isDraggingSlider && (
            <div
              className="sm:hidden absolute -top-[182px] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center p-1.5 rounded-2xl bg-slate-900/95 text-white border-2 border-amber-500/80 shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-none"
              style={{ width: '132px' }}
            >
              <div className="w-[120px] h-[155px] rounded-xl overflow-hidden bg-black/50 border border-amber-500/40 relative shadow-inner">
                <canvas ref={previewCanvasRef} className="w-full h-full object-contain block" />
              </div>
              {/* Arrow pointing down towards slider */}
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

          {/* Intensity Slider Bar (Only shown when filter is ON) */}
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

      {/* ── SIMPLE CLEAN TOGGLES (Only shown for Oscorp card) ── */}
      {template.id !== 'loki-tva-id' && (
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

              {/* 3D Retro Bevel Pill Toggle Switch */}
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

              {/* 3D Retro Bevel Pill Toggle Switch */}
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

          {/* Sunken Windows 98 Style Text Input for QR Link (Appears when custom qr is turned ON) */}
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

      {/* Inline Field Popover for QR Code URL (matching ImageCropModal UI) */}
      {editingField && editingField === 'qrUrl' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="flex flex-col items-center gap-3 w-full max-w-sm">
            {/* Main White Card Container */}
            <div className="bg-white border border-black/60 rounded-lg w-full overflow-hidden shadow-2xl flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-black text-lg flex items-center gap-2 tracking-tight">
                  <Pencil className="w-4 h-4 text-black" /> Edit QR Code Link
                </h3>
              </div>

              <div className="w-full">
                <input
                  type="text"
                  autoFocus
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveField()}
                  placeholder="Enter custom URL or text for QR code..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-black font-sans"
                />
              </div>
            </div>

            {/* Bottom Button Row: Cross (Left) & Tick (Right) with full-height partition line */}
            <div className="grid grid-cols-2 w-full bg-white border border-black/60 rounded-lg overflow-hidden shadow-lg h-11">
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="flex items-center justify-center text-black hover:bg-slate-100 transition border-r border-black/60 h-full cursor-pointer"
                title="Cancel"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
              <button
                type="button"
                onClick={handleSaveField}
                className="flex items-center justify-center text-black hover:bg-slate-100 transition h-full cursor-pointer"
                title="Apply changes"
              >
                <Check className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
