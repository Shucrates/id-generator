import React, { useState, useRef } from 'react';

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
        height: '100vh',
        backgroundColor: '#fafafa',
        fontFamily: "'Arial Narrow', 'Arial', sans-serif",
        overflow: 'hidden',
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
      <div style={{ position: 'absolute', top: '40px', left: '60px', zIndex: 10 }}>
        <button
          onClick={onBackToTemplates}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: 'clamp(20px, 2.2vw, 26px)',
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
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '36px',
          width: '90%',
          maxWidth: '900px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(44px, 6vw, 76px)',
            fontWeight: 400,
            color: '#1d19ea',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            fontFamily: "'Arial Narrow', 'Arial', sans-serif",
          }}
        >
          thank you for downloading!!
        </h1>

        {/* 3 Buttons Row matching existing site button styles */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={onMakeAnother}
            className="btn-wireframe px-8 sm:px-12 py-3.5 sm:py-4 text-base sm:text-lg font-bold tracking-tight shadow-md cursor-pointer min-w-[170px]"
            style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
          >
            make another
          </button>

          <button
            onClick={() => window.open('https://buymeacoffee.com', '_blank')}
            className="btn-wireframe px-8 sm:px-12 py-3.5 sm:py-4 text-base sm:text-lg font-bold tracking-tight shadow-md cursor-pointer min-w-[170px]"
            style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
          >
            buy me a coffee
          </button>

          <button
            onClick={() => window.open('https://instagram.com/shuisbored', '_blank')}
            className="btn-wireframe px-8 sm:px-12 py-3.5 sm:py-4 text-base sm:text-lg font-bold tracking-tight shadow-md cursor-pointer min-w-[170px]"
            style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
          >
            follow me
          </button>
        </div>
      </div>

      {/* ── Bottom Right: New Pixel Cat Asset with TY <3 bubble ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '36px',
          right: '50px',
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
            height: 'clamp(110px, 14vw, 170px)',
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
