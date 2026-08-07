import React, { useState, useRef } from 'react';

function PixelInstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black">
      <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h16V4H4zm8 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5-3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
    </svg>
  );
}

function PixelCoffeeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black">
      <path d="M2 19h18v2H2v-2zM4 3h12v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V3zm2 2v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5H6zm10 2h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3V7zm2 2v2h1V9h-1z" />
    </svg>
  );
}

function PixelPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black">
      <path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z" />
    </svg>
  );
}

export default function ThankYouPage({ onBackToTemplates, onMakeAnother }) {
  const [isCatAnimating, setIsCatAnimating] = useState(false);
  const audioRef = useRef(null);

  const handleCatClick = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/meow.ogg');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.log('Audio play error:', err));
    } catch (e) {
      console.log('Audio error:', e);
    }

    setIsCatAnimating(true);
    setTimeout(() => setIsCatAnimating(false), 450);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        fontFamily: "'Arial Narrow', 'Arial', sans-serif",
        overflowX: 'hidden',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* Keyframe animation styles */}
      <style>{`
        @keyframes catMeow {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.12, 0.92) rotate(-4deg); }
          50% { transform: scale(0.94, 1.08) rotate(4deg); }
          75% { transform: scale(1.04, 0.97) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .cat-animate {
          animation: catMeow 0.45s ease-in-out;
        }
      `}</style>

      {/* ── Top Left: Back to Templates Button ── */}
      <div style={{ position: 'absolute', top: 'clamp(20px, 4vw, 40px)', left: 'clamp(20px, 4vw, 60px)', zIndex: 10 }}>
        <button
          onClick={onBackToTemplates}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: 'clamp(18px, 4vw, 26px)',
            fontWeight: 400,
            color: '#000000',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Arial Narrow', 'Arial', sans-serif",
            padding: 0,
          }}
        >
          <span style={{ fontSize: '1.2em', lineHeight: 1 }}>←</span> templates
        </button>
      </div>

      {/* ── DEAD CENTER CONTENT: Thank You Title + 3 Action Buttons ── */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          width: '92%',
          maxWidth: '900px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(32px, 6vw, 76px)',
            fontWeight: 400,
            color: '#1d19ea',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            fontFamily: "'Arial Narrow', 'Arial', sans-serif",
          }}
        >
          thank you for downloading!!
        </h1>

        {/* 3 Buttons Row matching existing site button styles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 w-full max-w-xs sm:max-w-none px-4">
          <button
            onClick={onMakeAnother}
            className="btn-wireframe w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-bold tracking-tight shadow-md cursor-pointer inline-flex items-center justify-center gap-2 min-w-[160px] sm:min-w-[170px]"
            style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
          >
            <PixelPlusIcon /> make another
          </button>

          <button
            onClick={() => window.open('https://buymeacoffee.com/shuisbored', '_blank')}
            className="btn-wireframe w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-bold tracking-tight shadow-md cursor-pointer inline-flex items-center justify-center gap-2 min-w-[160px] sm:min-w-[170px]"
            style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
          >
            <PixelCoffeeIcon /> buy me a coffee
          </button>

          <button
            onClick={() => window.open('https://www.instagram.com/shuisbored/', '_blank')}
            className="btn-wireframe w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-bold tracking-tight shadow-md cursor-pointer inline-flex items-center justify-center gap-2 min-w-[160px] sm:min-w-[170px]"
            style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
          >
            <PixelInstagramIcon /> follow me
          </button>
        </div>
      </div>

      {/* ── Bottom Right: New Pixel Cat Asset with TY <3 bubble ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <img
          src="/pixel-cat-ty.png"
          alt="TY Cat"
          onClick={handleCatClick}
          className={isCatAnimating ? 'cat-animate' : ''}
          style={{
            height: 'clamp(80px, 14vw, 170px)',
            width: 'auto',
            objectFit: 'contain',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          title="Click me!"
        />
      </div>
    </div>
  );
}
