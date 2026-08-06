import React, { useRef, useEffect, useState } from 'react';
import { renderCardCanvas } from '../utils/canvasRenderer';
import { RotateCw, Eye, RefreshCw, ZoomIn, ZoomOut, Layers } from 'lucide-react';

export default function CanvasPreview({ template, userData, croppedPhotoUrl, activeSide, setActiveSide }) {
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Debounced live canvas render on input / photo / template change
  useEffect(() => {
    let isCancelled = false;

    async function updateCanvases() {
      setIsRendering(true);
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
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    }

    const timer = setTimeout(() => {
      updateCanvases();
    }, 80);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [template, userData, croppedPhotoUrl]);

  const toggleFlip = () => {
    const nextSide = activeSide === 'front' ? 'back' : 'front';
    setActiveSide(nextSide);
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Side Switch & Flip Controls */}
      <div className="flex items-center gap-2 mb-4 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={() => {
            setActiveSide('front');
            setIsFlipped(false);
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSide === 'front'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Front Side
        </button>

        {template.hasBackSide && (
          <button
            onClick={() => {
              setActiveSide('back');
              setIsFlipped(true);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSide === 'back'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Back Side
          </button>
        )}

        {template.hasBackSide && (
          <button
            onClick={toggleFlip}
            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition"
            title="Flip Card 180°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3D Flip Card Container */}
      <div className="w-full flex justify-center perspective-1000 py-2">
        <div
          className={`relative w-[320px] sm:w-[360px] aspect-[638/1000] transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Canvas Face */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden canvas-glow transition-all border border-slate-700/80 bg-slate-900 ${
              activeSide === 'front' ? 'ring-2 ring-sky-500/30' : ''
            }`}
          >
            <canvas
              ref={frontCanvasRef}
              className="w-full h-full object-contain block"
            />
          </div>

          {/* Back Canvas Face */}
          {template.hasBackSide && (
            <div
              className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden canvas-glow transition-all border border-slate-700/80 bg-slate-900 ${
                activeSide === 'back' ? 'ring-2 ring-sky-500/30' : ''
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

      {/* Render Status Indicator */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <span className={`w-2 h-2 rounded-full ${isRendering ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
        <span>{isRendering ? 'Updating High-Res Canvas...' : 'Live High-Res Preview (1276x2000px)'}</span>
      </div>
    </div>
  );
}
