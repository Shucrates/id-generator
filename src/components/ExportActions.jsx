import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { renderCardCanvas } from '../utils/canvasRenderer';

export default function ExportActions({
  template,
  userData,
  croppedPhotoUrl,
  isCustomMode,
  setIsCustomMode,
  onCustomModeTrigger
}) {
  const [isExporting, setIsExporting] = useState(false);

  const fireConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.85 }
    });
  };

  const getRenderedCanvasBlob = async (side = 'front') => {
    const tempCanvas = document.createElement('canvas');
    await renderCardCanvas({
      canvas: tempCanvas,
      template,
      userData,
      croppedPhotoUrl,
      side,
      scale: template.exportScale || 1,
      isCustomMode
    });

    return new Promise((resolve) => {
      tempCanvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const prefix = isCustomMode ? 'custom_id' : 'oscorp_richard_parker_id';

      // Render front and back side blobs
      const frontBlob = await getRenderedCanvasBlob('front');
      const backBlob = await getRenderedCanvasBlob('back');

      // Add PNGs to zip archive
      zip.file(`${prefix}_front.png`, frontBlob);
      zip.file(`${prefix}_back.png`, backBlob);

      // Generate zip file blob
      const content = await zip.generateAsync({ type: 'blob' });

      // Trigger browser download of zip file
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prefix}_cards.zip`;
      link.click();
      URL.revokeObjectURL(url);

      fireConfetti();
    } catch (err) {
      console.error("ZIP Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFollowCreator = () => {
    window.open('https://github.com/Shucrates', '_blank');
  };

  return (
    <div className="flex items-center justify-center gap-6 sm:gap-12 w-full max-w-xl my-6">
      {!isCustomMode ? (
        // SCREEN 1 BUTTONS
        <>
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="btn-wireframe px-6 sm:px-10 py-3 text-sm sm:text-base tracking-tight shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isExporting ? 'zipping...' : 'download default'}
          </button>

          <button
            onClick={() => {
              if (onCustomModeTrigger) {
                onCustomModeTrigger();
              } else {
                setIsCustomMode(true);
              }
            }}
            className="btn-wireframe px-6 sm:px-10 py-3 text-sm sm:text-base tracking-tight shadow-sm active:scale-95"
          >
            create your own
          </button>
        </>
      ) : (
        // SCREEN 2 BUTTONS
        <>
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="btn-wireframe px-6 sm:px-10 py-3 text-sm sm:text-base tracking-tight shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isExporting ? 'zipping...' : 'download custom id'}
          </button>

          <button
            onClick={handleFollowCreator}
            className="btn-wireframe px-6 sm:px-10 py-3 text-sm sm:text-base tracking-tight shadow-sm active:scale-95"
          >
            follow the creator
          </button>
        </>
      )}
    </div>
  );
}
