import React, { useRef, useEffect, useState } from 'react';
import { renderCardCanvas } from '../utils/canvasRenderer';
import { Pencil, Check, X, Link as LinkIcon } from 'lucide-react';

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
  isDownloaded = false
}) {
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const [editingField, setEditingField] = useState(null); // 'name' | 'qrUrl'
  const [tempValue, setTempValue] = useState('');

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
            showCuttingGuides
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
  }, [template, userData, croppedPhotoUrl, isCustomMode, editingField, backVersion, showCuttingGuides]);

  const handleFieldClick = (fieldKey) => {
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
        <div className="relative w-[210px] xs:w-[250px] sm:w-[270px] md:w-[300px] aspect-[1515/2400] rounded-3xl overflow-hidden card-shadow border border-slate-300 bg-white shrink-0">
          <canvas
            ref={frontCanvasRef}
            className="w-full h-full object-contain block"
          />

          {/* Hotspots for Front Card in Customizer Mode */}
          {isCustomMode && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {/* Photo Box */}
              <div
                style={getPercentStyle(401, 910, 752, 940)}
                onClick={() => handleFieldClick('photo')}
                className="absolute on-card-field-hover flex items-center justify-center group"
                title="Upload Image"
              />

              {/* Name: Inline Input vs Hotspot */}
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
                  className="absolute on-card-field-hover flex items-center justify-center group"
                  title="Click to edit name"
                />
              )}
            </div>
          )}
        </div>

        {/* BACK CARD CONTAINER */}
        <div className="relative w-[210px] xs:w-[250px] sm:w-[270px] md:w-[300px] aspect-[1515/2400] rounded-3xl overflow-hidden card-shadow border border-slate-300 bg-white shrink-0">
          <canvas
            ref={backCanvasRef}
            className="w-full h-full object-contain block"
          />

          {/* Hotspot for QR Code on Back Card when QR Code Back Version is active */}
          {backVersion === 'custom-qr' && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <div
                style={getPercentStyle(800, 1460, 420, 420)}
                onClick={() => handleFieldClick('qrUrl')}
                className="absolute on-card-field-hover flex items-center justify-center group"
                title="Click to edit QR Code URL"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── SIMPLE CLEAN TOGGLES (No outer container box) ── */}
      <div className="w-full max-w-[600px] mx-auto my-3 px-4 flex flex-col items-center justify-center gap-2.5 select-none shrink-0 font-sans">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-14">
          
          {/* 1. CUTTING LINES TOGGLE */}
          <div className="flex items-center gap-2.5">
            <label
              className="text-[17px] font-bold text-[#1d19ea] flex items-center gap-1.5 leading-none cursor-pointer"
              onClick={() => setShowCuttingGuides && setShowCuttingGuides(!showCuttingGuides)}
              style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
            >
              <span>✂️</span> cutting lines
            </label>

            {/* 3D Retro Bevel Pill Toggle Switch */}
            <div
              onClick={() => setShowCuttingGuides && setShowCuttingGuides(!showCuttingGuides)}
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
                const nextVersion = backVersion === 'custom-qr' ? 'oscorp-symbol' : 'custom-qr';
                if (setBackVersion) setBackVersion(nextVersion);
              }}
              style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
            >
              <span>⚙️</span> custom qr
            </label>

            {/* 3D Retro Bevel Pill Toggle Switch */}
            <div
              onClick={() => {
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
