import React, { useState, useRef, useEffect } from 'react';
import { Pencil, RotateCcw, Check, X } from 'lucide-react';
import { playRetroClickSound } from '../utils/soundUtils';

export default function SignatureModal({
  isOpen,
  onClose,
  onSaveSignature,
  onLiveUpdateSignature,
  initialSignature = null
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialSignature));
  const lastPointRef = useRef({ x: 0, y: 0 });

  // Initialize canvas on modal open
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 2;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#050505';
      ctx.fillStyle = '#050505';
      ctx.lineWidth = 5; // Thicker line width

      if (initialSignature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
        img.src = initialSignature;
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
        setHasDrawn(false);
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [isOpen, initialSignature]);

  if (!isOpen) return null;

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    const { x, y } = getCanvasCoords(e);
    lastPointRef.current = { x, y };
    setIsDrawing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    setHasDrawn(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    setIsDrawing(false);

    // Live update signature in the background card as soon as the stroke completes
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      if (onLiveUpdateSignature) {
        onLiveUpdateSignature(dataUrl);
      } else if (onSaveSignature) {
        onSaveSignature(dataUrl);
      }
    }
  };

  const handleClear = () => {
    playRetroClickSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 2;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    if (onLiveUpdateSignature) {
      onLiveUpdateSignature(null);
    } else if (onSaveSignature) {
      onSaveSignature(null);
    }
  };

  const handleSave = () => {
    playRetroClickSound();
    if (hasDrawn && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSaveSignature(dataUrl);
    } else {
      onSaveSignature(null);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 font-sans"
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-2 w-full max-w-[320px] sm:max-w-[360px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Signature Plain White Canvas Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #a1a1a1',
            borderRadius: '0px',
            outline: 'none',
            boxShadow: 'none',
            width: '100%',
            height: '170px',
            position: 'relative',
            boxSizing: 'border-box',
          }}
          className="touch-none select-none"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full cursor-crosshair block"
            style={{ touchAction: 'none', display: 'block', width: '100%', height: '100%' }}
          />
        </div>

        {/* Action Button Row: Redo and Check button with EXACT SAME width */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            onClick={handleClear}
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
              boxSizing: 'border-box',
            }}
            className="hover:bg-slate-50 active:bg-slate-100 transition"
            title="Redo / Clear signature"
          >
            <RotateCcw className="w-4 h-4 text-black stroke-[2]" />
          </button>

          <button
            type="button"
            onClick={handleSave}
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
              boxSizing: 'border-box',
            }}
            className="hover:bg-slate-50 active:bg-slate-100 transition"
            title="Apply signature"
          >
            <Check className="w-5 h-5 text-black stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );
}
