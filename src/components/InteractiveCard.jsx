import React, { useRef, useEffect, useState } from 'react';
import { renderCardCanvas } from '../utils/canvasRenderer';
import { Pencil, Camera, Dices, Check, X } from 'lucide-react';

export default function InteractiveCard({
  template,
  userData,
  setUserData,
  croppedPhotoUrl,
  onOpenCropModal,
  activeSide,
  setActiveSide,
  isCustomizing
}) {
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [editingField, setEditingField] = useState(null); // 'name' | 'department' | 'idNumber' | 'roleLabel' | 'companyName'
  const [tempValue, setTempValue] = useState('');

  // Keep 3D flip state synchronized with activeSide
  useEffect(() => {
    setIsFlipped(activeSide === 'back');
  }, [activeSide]);

  // Debounced live canvas rendering
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
            scale: template.exportScale || 2
          });
        }

        if (backCanvasRef.current && template.hasBackSide) {
          await renderCardCanvas({
            canvas: backCanvasRef.current,
            template,
            userData,
            croppedPhotoUrl,
            side: 'back',
            scale: template.exportScale || 2
          });
        }
      } catch (err) {
        console.error("Canvas render error:", err);
      }
    }

    const timer = setTimeout(updateCanvases, 50);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [template, userData, croppedPhotoUrl]);

  const handleFieldClick = (fieldKey) => {
    if (!isCustomizing) return;

    if (fieldKey === 'photo') {
      const fileInput = document.getElementById('on-card-file-input');
      if (fileInput) fileInput.click();
      return;
    }

    setEditingField(fieldKey);
    setTempValue(userData[fieldKey] || '');
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

  const handleRandomizeId = () => {
    const randomVal = 'A' + String(Math.floor(10000 + Math.random() * 90000));
    setTempValue(randomVal);
    setUserData((prev) => ({
      ...prev,
      idNumber: randomVal
    }));
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

  // Percentages for interactive field overlays (638 x 1000 base)
  const getPercentStyle = (x, y, width, height) => ({
    left: `${(x / 638) * 100}%`,
    top: `${(y / 1000) * 100}%`,
    width: `${(width / 638) * 100}%`,
    height: `${(height / 1000) * 100}%`
  });

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hidden File Input */}
      <input
        id="on-card-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 3D Card Container */}
      <div className="w-full flex justify-center perspective-1000 py-2">
        <div
          className={`relative w-[340px] sm:w-[400px] md:w-[420px] aspect-[638/1000] transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden y2k-swirl-glow border border-slate-700/80 bg-white ${
              activeSide === 'front' ? 'ring-2 ring-cyan-500/50' : ''
            }`}
          >
            <canvas
              ref={frontCanvasRef}
              className="w-full h-full object-contain block"
            />

            {/* Clickable Overlay Hotspots (Active in Customize Mode) */}
            {!isFlipped && isCustomizing && (
              <div className="absolute inset-0 z-10 pointer-events-auto">
                {/* 1. Logo / Company Title */}
                <div
                  style={getPercentStyle(120, 75, 400, 100)}
                  onClick={() => handleFieldClick('companyName')}
                  className="absolute on-card-field-hover flex items-center justify-center group"
                  title="Click to edit Company Logo"
                >
                  <span className="hidden group-hover:flex items-center gap-1 bg-cyan-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    <Pencil className="w-3 h-3" /> Edit Logo
                  </span>
                </div>

                {/* 2. Left Vertical Role ("STAFF") */}
                <div
                  style={getPercentStyle(60, 210, 90, 420)}
                  onClick={() => handleFieldClick('roleLabel')}
                  className="absolute on-card-field-hover flex items-center justify-center group"
                  title="Click to edit Role"
                >
                  <span className="hidden group-hover:flex items-center gap-1 bg-cyan-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow rotate-90">
                    <Pencil className="w-3 h-3" /> Role
                  </span>
                </div>

                {/* 3. Center Photo Box */}
                <div
                  style={getPercentStyle(165, 220, 308, 380)}
                  onClick={() => handleFieldClick('photo')}
                  className="absolute on-card-field-hover flex flex-col items-center justify-center group"
                  title="Click to upload Photo"
                >
                  <div className="hidden group-hover:flex flex-col items-center gap-1 bg-cyan-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    <Camera className="w-5 h-5" />
                    <span>Upload Photo</span>
                  </div>
                </div>

                {/* 4. Right Vertical ID Number ("No. A00473") */}
                <div
                  style={getPercentStyle(490, 220, 90, 420)}
                  onClick={() => handleFieldClick('idNumber')}
                  className="absolute on-card-field-hover flex items-center justify-center group"
                  title="Click to edit ID Number"
                >
                  <span className="hidden group-hover:flex items-center gap-1 bg-cyan-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow -rotate-90">
                    <Pencil className="w-3 h-3" /> ID
                  </span>
                </div>

                {/* 5. Name ("Richard Parker") */}
                <div
                  style={getPercentStyle(100, 630, 438, 70)}
                  onClick={() => handleFieldClick('name')}
                  className="absolute on-card-field-hover flex items-center justify-center group"
                  title="Click to edit Name"
                >
                  <span className="hidden group-hover:flex items-center gap-1 bg-cyan-400 text-black text-[10px] font-bold px-2.5 py-1 rounded shadow">
                    <Pencil className="w-3.5 h-3.5" /> Edit Name
                  </span>
                </div>

                {/* 6. Department ("GENETICS LABORATORY") */}
                <div
                  style={getPercentStyle(80, 725, 478, 70)}
                  onClick={() => handleFieldClick('department')}
                  className="absolute on-card-field-hover flex items-center justify-center group"
                  title="Click to edit Department"
                >
                  <span className="hidden group-hover:flex items-center gap-1 bg-cyan-400 text-black text-[10px] font-bold px-2.5 py-1 rounded shadow">
                    <Pencil className="w-3.5 h-3.5" /> Edit Department
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* BACK SIDE */}
          {template.hasBackSide && (
            <div
              className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden y2k-swirl-glow border border-slate-700/80 bg-white ${
                activeSide === 'back' ? 'ring-2 ring-cyan-500/50' : ''
              }`}
            >
              <canvas
                ref={backCanvasRef}
                className="w-full h-full object-contain block"
              />
            </div>
          )}
        </div>
      </div>

      {/* Inline Field Popover */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl y2k-border-glow flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm capitalize flex items-center gap-2">
                <Pencil className="w-4 h-4 text-cyan-400" /> Edit Badge {editingField}
              </h3>
              <button
                onClick={() => setEditingField(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveField()}
                placeholder={`Enter ${editingField}...`}
                className="flex-1 px-4 py-2.5 bg-black border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
              />

              {editingField === 'idNumber' && (
                <button
                  onClick={handleRandomizeId}
                  title="Randomize ID"
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl border border-slate-700 transition"
                >
                  <Dices className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveField}
                className="flex items-center gap-1.5 px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold rounded-xl shadow-lg shadow-cyan-400/20"
              >
                <Check className="w-4 h-4" /> Save Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
