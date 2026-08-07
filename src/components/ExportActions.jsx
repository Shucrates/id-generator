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
  onCustomModeTrigger,
  backVersion = 'oscorp-symbol',
  showCuttingGuides = false,
  onDownloadComplete
}) {
  const [isExporting, setIsExporting] = useState(false);

  const fireConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 }
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
      scale: 2, // Ultra HD High Resolution Export (3030 x 4800 pixels)
      isCustomMode,
      backVersion,
      showCuttingGuides
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

      // Navigate to Thank You page after download completes
      setTimeout(() => {
        if (onDownloadComplete) {
          onDownloadComplete();
        }
      }, 400);
    } catch (err) {
      console.error("ZIP Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGoBackToDefault = () => {
    setIsCustomMode(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full pb-3 sm:pb-0">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 w-full max-w-xl my-2 px-4">
        {!isCustomMode ? (
          // DEFAULT MODE BUTTONS
          <>
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="btn-wireframe w-full sm:w-auto px-6 sm:px-14 py-3 sm:py-4 text-sm sm:text-lg tracking-tight shadow-md cursor-pointer disabled:opacity-50 min-w-[180px] sm:min-w-[240px]"
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
              className="btn-wireframe w-full sm:w-auto px-6 sm:px-14 py-3 sm:py-4 text-sm sm:text-lg tracking-tight shadow-md cursor-pointer min-w-[180px] sm:min-w-[240px]"
            >
              create your own
            </button>
          </>
        ) : (
          // CUSTOM MODE BUTTONS
          <>
            <button
              onClick={handleGoBackToDefault}
              className="btn-wireframe w-full sm:w-auto px-6 sm:px-14 py-3 sm:py-4 text-sm sm:text-lg tracking-tight shadow-md cursor-pointer min-w-[180px] sm:min-w-[240px]"
            >
              go back to default
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="btn-wireframe w-full sm:w-auto px-6 sm:px-14 py-3 sm:py-4 text-sm sm:text-lg tracking-tight shadow-md cursor-pointer disabled:opacity-50 min-w-[180px] sm:min-w-[240px]"
            >
              {isExporting ? 'zipping...' : 'download custom id'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
