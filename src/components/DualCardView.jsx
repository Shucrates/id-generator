import React, { useRef, useEffect, useState } from 'react';
import { renderCardCanvas } from '../utils/canvasRenderer';
import { Pencil, Camera, Dices, Check, X, QrCode } from 'lucide-react';

export default function DualCardView({
  template,
  userData,
  setUserData,
  croppedPhotoUrl,
  onOpenCropModal,
  isCustomMode
}) {
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const [editingField, setEditingField] = useState(null); // 'name' | 'department' | 'idNumber' | 'roleLabel' | 'companyName' | 'qrUrl'
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
            scale: template.exportScale || 2,
            isCustomMode,
            isEditingName: editingField === 'name'
          });
        }

        if (backCanvasRef.current && template.hasBackSide) {
          await renderCardCanvas({
            canvas: backCanvasRef.current,
            template,
            userData,
            croppedPhotoUrl,
            side: 'back',
            scale: template.exportScale || 2,
            isCustomMode
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
  }, [template, userData, croppedPhotoUrl, isCustomMode, editingField]);

  const handleFieldClick = (fieldKey) => {
    if (!isCustomMode) return;

    if (fieldKey === 'photo') {
      const fileInput = document.getElementById('wireframe-file-input');
      if (fileInput) fileInput.click();
      return;
    }

    setEditingField(fieldKey);
    const currentVal = userData[fieldKey] || '';
    setTempValue(currentVal);
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

  // Percentages for overlay hotspots on 1515 x 2400 base card
  const getPercentStyle = (x, y, width, height) => ({
    left: `${(x / 1515) * 100}%`,
    top: `${(y / 2400) * 100}%`,
    width: `${(width / 1515) * 100}%`,
    height: `${(height / 2400) * 100}%`
  });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto">
      {/* Hidden File Input */}
      <input
        id="wireframe-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Side-by-Side Cards Grid */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full py-4">
        {/* FRONT CARD CONTAINER */}
        <div className="relative w-[280px] sm:w-[320px] md:w-[350px] aspect-[1515/2400] rounded-3xl overflow-hidden card-shadow border border-slate-300 bg-white">
          <canvas
            ref={frontCanvasRef}
            className="w-full h-full object-contain block"
          />

          {/* Hotspots for Front Card in Customizer Mode (ONLY Image and Name) */}
          {isCustomMode && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {/* Photo Box: w 752, h 1370 at x 401, y 476 */}
              <div
                style={getPercentStyle(401, 910, 752, 940)}
                onClick={() => handleFieldClick('photo')}
                className="absolute on-card-field-hover flex items-center justify-center group"
                title="Upload Image"
              />

              {/* Name: x 200, y 1965, w 1115, h 110 - Direct Inline Editing */}
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
                      fontSize: 'clamp(14px, 4.3vw, 24px)'
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
        <div className="relative w-[280px] sm:w-[320px] md:w-[350px] aspect-[1515/2400] rounded-3xl overflow-hidden card-shadow border border-slate-300 bg-white">
          <canvas
            ref={backCanvasRef}
            className="w-full h-full object-contain block"
          />

          {/* Hotspot for QR Code on Back Card in Customizer Mode */}
          {isCustomMode && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {/* QR Box: x 780, y 1520, w 408, h 408 */}
              <div
                style={getPercentStyle(800, 1460, 420, 420)}
                onClick={() => handleFieldClick('qrUrl')}
                className="absolute on-card-field-hover flex items-center justify-center group"
                title="Add QR Code URL"
              />
            </div>
          )}
        </div>
      </div>

      {/* Inline Field Popover ONLY for QR Code URL */}
      {editingField && editingField === 'qrUrl' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base capitalize flex items-center gap-2">
                <Pencil className="w-4 h-4 text-slate-700" /> Edit QR Code URL
              </h3>
              <button
                onClick={() => setEditingField(null)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg"
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
                placeholder="Enter URL or text for QR code..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-black font-sans"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveField}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow"
              >
                <Check className="w-4 h-4" /> Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
