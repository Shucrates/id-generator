import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Check, X } from 'lucide-react';

// Helper function to create a cropped image DataURL from cropped pixels
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((res) => (image.onload = res));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/png');
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  aspectRatio = 752 / 940,
  onClose,
  onCropComplete
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedDataUrl = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
        onCropComplete(croppedDataUrl);
      }
      onClose();
    } catch (err) {
      console.error("Error cropping image:", err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onCropComplete(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
              onCropComplete(reader.result);
            };
            reader.readAsDataURL(file);
          }
        }}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        {/* Main White Card Container */}
        <div className="bg-white border-2 border-black rounded-lg w-full overflow-hidden shadow-2xl flex flex-col items-center p-4">
          {!imageSrc ? (
            /* Upload / Drop Box State matching screenshot 2 */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/5] border border-dashed border-slate-300 rounded flex items-center justify-center cursor-pointer hover:border-black transition"
            >
              <h2 className="font-sans font-bold text-xl sm:text-2xl text-black tracking-tight">
                Drop or Upload
              </h2>
            </div>
          ) : (
            /* Cropper Area matching screenshot 3 */
            <div className="flex flex-col items-center w-full gap-4">
              <div className="relative w-full aspect-[4/5] bg-slate-100 border border-slate-300 rounded overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspectRatio}
                  onCropChange={onCropChange}
                  onCropComplete={handleCropComplete}
                  onZoomChange={onZoomChange}
                />
              </div>

              {/* Minimal Slider Controls */}
              <div className="flex items-center gap-3 w-full px-2">
                <ZoomOut className="w-4 h-4 text-black" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <ZoomIn className="w-4 h-4 text-black" />
              </div>

              {/* Minimal Control Buttons Row */}
              <div className="grid grid-cols-3 w-full border border-slate-300 rounded overflow-hidden divide-x divide-slate-300">
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="py-2.5 flex items-center justify-center hover:bg-slate-100 transition"
                  title="Rotate clockwise"
                >
                  <RotateCw className="w-5 h-5 text-black" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="py-2.5 flex items-center justify-center hover:bg-slate-100 transition"
                  title="Rotate counter-clockwise"
                >
                  <RotateCcw className="w-5 h-5 text-black" />
                </button>
                <button
                  onClick={handleSave}
                  className="py-2.5 flex items-center justify-center hover:bg-slate-100 transition"
                  title="Confirm image"
                >
                  <Check className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Minimal Close Button matching screenshot */}
        <div className="w-full bg-white border-2 border-black rounded-lg py-2.5 flex items-center justify-center shadow-lg">
          <button
            onClick={onClose}
            className="text-black hover:opacity-70 transition p-1"
            title="Close modal"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
