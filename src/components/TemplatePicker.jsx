import React, { useState, useRef } from 'react';
import { playRetroClickSound } from '../utils/soundUtils';

function CurvedArrow() {
  return (
    <svg width="140" height="45" viewBox="0 0 160 50" fill="none" className="select-none pointer-events-none shrink-0">
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
          maxWidth: '1500px',
          margin: '0 auto',
          padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 50px)',
          boxSizing: 'border-box',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Top Row: Back Button ── */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={(e) => {
              playRetroClickSound();
              if (onBack) onBack(e);
            }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(44px, 7vw, 92px)',
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
              height: 'clamp(50px, 7.5vw, 102px)',
              width: 'auto',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ── Main Workspace Content Grid: 3 Templates in a Row ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 'clamp(40px, 5vw, 60px)',
            width: '100%',
          }}
        >
          {/* Row of 3 Templates */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: '40px clamp(48px, 6vw, 110px)',
              width: '100%',
            }}
          >
            {/* 1. Oscorp Staff ID Card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '100%', justifyContent: 'flex-end' }}>
              <div
                style={{
                  minHeight: 'clamp(320px, 32vw, 440px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  onClick={() => {
                    playRetroClickSound();
                    if (onSelectTemplate) onSelectTemplate('oscorp-staff');
                  }}
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
                      width: 'clamp(220px, 22vw, 290px)',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </div>
              </div>

              <h3
                style={{
                  margin: '18px auto 0 auto',
                  textAlign: 'center',
                  width: '100%',
                  fontSize: 'clamp(20px, 2.2vw, 28px)',
                  fontWeight: 400,
                  color: '#1d19ea',
                  letterSpacing: '-0.02em',
                  fontFamily: "'Arial Narrow', 'Arial', sans-serif",
                }}
              >
                tasm: oscorp staff id
              </h3>
            </div>

            {/* 2. Loki TVA ID Card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '100%', justifyContent: 'flex-end' }}>
              <div
                style={{
                  minHeight: 'clamp(320px, 32vw, 440px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  onClick={() => {
                    playRetroClickSound();
                    if (onSelectTemplate) onSelectTemplate('loki-tva-id');
                  }}
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
                    src="/tva-loki-card-stacked.png?v=2"
                    alt="Loki TVA ID Card Stack"
                    style={{
                      width: 'clamp(220px, 22vw, 290px)',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </div>
              </div>

              <h3
                style={{
                  margin: '18px auto 0 auto',
                  textAlign: 'center',
                  width: '100%',
                  fontSize: 'clamp(20px, 2.2vw, 28px)',
                  fontWeight: 400,
                  color: '#1d19ea',
                  letterSpacing: '-0.02em',
                  fontFamily: "'Arial Narrow', 'Arial', sans-serif",
                }}
              >
                doomsday: loki tva id
              </h3>
            </div>

            {/* 3. Superbad McLovin Driver License Card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '100%', justifyContent: 'flex-end' }}>
              <div
                style={{
                  minHeight: 'clamp(320px, 32vw, 440px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  onClick={() => {
                    playRetroClickSound();
                    if (onSelectTemplate) onSelectTemplate('mclovin-license');
                  }}
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
                    src="/mclovin-card-stacked.png"
                    alt="Superbad McLovin Driver License Stack"
                    style={{
                      width: 'clamp(245px, 24vw, 320px)',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </div>
              </div>

              <h3
                style={{
                  margin: '18px auto 0 auto',
                  textAlign: 'center',
                  width: '100%',
                  fontSize: 'clamp(20px, 2.2vw, 28px)',
                  fontWeight: 400,
                  color: '#1d19ea',
                  letterSpacing: '-0.02em',
                  fontFamily: "'Arial Narrow', 'Arial', sans-serif",
                  lineHeight: 1.25,
                }}
              >
                superbad: mclovin's driver license
                <span
                  style={{
                    display: 'block',
                    fontSize: '1em',
                    color: '#1d19ea',
                    marginTop: '3px',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                  }}
                >
                  (don't use this to buy alcohol!!!)
                </span>
              </h3>
            </div>
          </div>

          {/* Bottom Row: More Coming Soon + Interactive Cat (Centered Below) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: 'clamp(10px, 2vw, 20px)',
              marginBottom: '30px',
              userSelect: 'none',
            }}
          >
            <img
              src="/pixel-cat.png"
              alt="Pixel Cat"
              onClick={handleCatClick}
              className={isCatAnimating ? 'cat-animate' : ''}
              style={{
                width: 'clamp(44px, 5vw, 68px)',
                height: 'auto',
                objectFit: 'contain',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              title="Click me to meow!"
            />
            <span
              style={{
                fontSize: 'clamp(20px, 2.4vw, 30px)',
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