import React, { useState, useRef } from 'react';

function CurvedArrow() {
  return (
    <svg width="160" height="50" viewBox="0 0 160 50" fill="none" className="select-none pointer-events-none">
      <path
        d="M 150 42 C 100 10, 50 12, 12 24"
        stroke="#000000"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M 24 16 L 12 24 L 23 32"
        stroke="#000000"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TemplatePicker({ onSelectTemplate, onBack }) {
  const [isCatAnimating, setIsCatAnimating] = useState(false);
  const audioRef = useRef(null);

  const handleCatClick = () => {
    // Play Meow Sound
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/meow.ogg');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.log('Audio play error:', err));
    } catch (e) {
      console.log('Audio play error:', e);
    }

    // Trigger Cat Animation
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

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '40px 60px',
          boxSizing: 'border-box',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Top Row: Back Button ── */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: 'clamp(20px, 2.2vw, 28px)',
              fontWeight: 400,
              color: '#000',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Arial Narrow', 'Arial', sans-serif",
              padding: 0,
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '1.3em', lineHeight: 1 }}>←</span> back
          </button>
        </div>

        {/* ── Header Title + Pencil Icon ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '60px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(54px, 7vw, 92px)',
              fontWeight: 400,
              color: '#1d19ea',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              fontFamily: "'Arial Narrow', 'Arial', sans-serif",
            }}
          >
            templates
          </h1>
          <img
            src="/pixel-pencil.png"
            alt="Pencils"
            style={{
              height: 'clamp(68px, 8.5vw, 102px)',
              width: 'auto',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ── Main Workspace Content Grid ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '40px',
          }}
        >
          {/* Left Column: Stacked Card + Click to Edit Arrow + Label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {/* Stacked Card Preview Button - ONLY this redirects to editor */}
              <div
                onClick={onSelectTemplate}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Click card to edit"
              >
                <img
                  src="/oscorp-card-stacked.png"
                  alt="TASM Oscorp Staff ID Card Stack"
                  style={{
                    width: 'clamp(200px, 22vw, 270px)',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>

              {/* Click to Edit Arrow & Label - NON INTERACTIVE (No redirect) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginLeft: '28px',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                <CurvedArrow />
                <span
                  style={{
                    fontSize: 'clamp(18px, 1.8vw, 24px)',
                    color: '#000',
                    marginTop: '4px',
                    marginLeft: '135px',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
                  }}
                >
                  click to edit!
                </span>
              </div>
            </div>

            {/* Template Title Label */}
            <h3
              style={{
                margin: '24px 0 0 26px',
                fontSize: 'clamp(22px, 2.2vw, 28px)',
                fontWeight: 400,
                color: '#1d19ea',
                letterSpacing: '-0.02em',
                fontFamily: "'Arial Narrow', 'Arial', sans-serif",
              }}
            >
              TASM : Oscorp Staff ID
            </h3>
          </div>

          {/* Right Column: More Coming Soon + Interactive Cat */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '60px',
              marginRight: '40px',
              userSelect: 'none',
            }}
          >
            <img
              src="/pixel-cat.png"
              alt="Pixel Cat"
              onClick={handleCatClick}
              className={isCatAnimating ? 'cat-animate' : ''}
              style={{
                width: 'clamp(48px, 5vw, 68px)',
                height: 'auto',
                objectFit: 'contain',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              title="Click me to meow!"
            />
            <span
              style={{
                fontSize: 'clamp(22px, 2.4vw, 30px)',
                fontWeight: 400,
                color: '#000',
                letterSpacing: '-0.02em',
                fontFamily: "'Arial Narrow', 'Arial', sans-serif",
              }}
            >
              more coming soon!!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}