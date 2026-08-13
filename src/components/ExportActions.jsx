import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { renderCardCanvas } from '../utils/canvasRenderer';
import { playRetroClickSound } from '../utils/soundUtils';

function PixelDownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black">
      <path d="M11 2h2v10h3l-4 4-4-4h3V2zM4 18h16v2H4v-2z" />
    </svg>
  );
}

function PixelPaintbrushIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black">
      <path d="M18 2h4v4h-4V2zM14 6h4v4h-4V6zM10 10h4v4h-4v-4zM6 14h4v4H6v-4zM2 18h4v4H2v-4zM4 14h2v2H4v-2zm4-4h2v2H8v-2zm4-4h2v2h-2V6z" />
    </svg>
  );
}

function PixelUndoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black">
      <path d="M13 5v4H7a5 5 0 0 0-5 5v5h2v-5a3 3 0 0 1 3-3h6v4l6-5-6-5z" />
    </svg>
  );
}

export default function ExportActions({
  template,
  userData,
  croppedPhotoUrl,
  isCustomMode,
  setIsCustomMode,
  onCustomModeTrigger,
  backVersion = 'oscorp-symbol',
  showCuttingGuides = false,
  applyTvaFilter = true,
  tvaFilterIntensity = 45,
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
      showCuttingGuides,
      applyTvaFilter,
      tvaFilterIntensity
    });

    return new Promise((resolve) => {
      tempCanvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });
  };

  const handleDownloadZip = async () => {
    playRetroClickSound();
    setIsExporting(true);
    try {
      const zip = new JSZip();
      let prefix = 'custom_id';
      if (template.id === 'loki-tva-id') {
        prefix = isCustomMode ? 'loki_tva_custom_id' : 'loki_tva_id';
      } else {
        prefix = isCustomMode ? 'custom_id' : 'oscorp_richard_parker_id';
      }

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
    playRetroClickSound();
    setIsCustomMode(false);
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full pb-3 sm:pb-0 ${template?.id === 'loki-tva-id' ? 'pt-3 sm:pt-4' : 'pt-2'}`}>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 w-full max-w-xl my-2 px-4">
        {!isCustomMode ? (
          // DEFAULT MODE BUTTONS
          <>
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="btn-wireframe w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-4 text-sm sm:text-lg tracking-tight shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[180px] sm:min-w-[240px]"
            >
              <PixelDownloadIcon />
              {isExporting ? 'zipping...' : 'download default'}
            </button>

            <button
              onClick={() => {
                playRetroClickSound();
                if (onCustomModeTrigger) {
                  onCustomModeTrigger();
                } else {
                  setIsCustomMode(true);
                }
              }}
              className="btn-wireframe w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-4 text-sm sm:text-lg tracking-tight shadow-md cursor-pointer inline-flex items-center justify-center gap-2 min-w-[180px] sm:min-w-[240px]"
            >
              <img
                src="/pixel-paintbrush-icon.png"
                alt="Paintbrush Icon"
                className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] object-contain shrink-0 select-none pointer-events-none"
              />
              create your own
            </button>
          </>
        ) : (
          // CUSTOM MODE BUTTONS
          <>
            <button
              onClick={handleGoBackToDefault}
              className="btn-wireframe w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-4 text-sm sm:text-lg tracking-tight shadow-md cursor-pointer inline-flex items-center justify-center gap-2 min-w-[180px] sm:min-w-[240px]"
            >
              <PixelUndoIcon />
              go back to default
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="btn-wireframe w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-4 text-sm sm:text-lg tracking-tight shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[180px] sm:min-w-[240px]"
            >
              <PixelDownloadIcon />
              {isExporting ? 'zipping...' : 'download custom id'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
