import React, { useState, useCallback, useRef, useEffect } from 'react';
import { playRetroClickSound } from '../utils/soundUtils';

const assets = {
  object: 'https://www.figma.com/api/mcp/asset/9f438ed3-f0cc-4075-878d-2031e9b4a13d.png',
  mug: 'https://www.figma.com/api/mcp/asset/ba3ff764-2846-41cd-8e08-757f4446f44e.png',
  star: 'https://www.figma.com/api/mcp/asset/ca0d04b1-d6d7-49a9-9a65-54eea0b80a07.png',
  disc: 'https://www.figma.com/api/mcp/asset/5469bc8e-0f3d-4f88-a221-9eee91fcd560.png',
  warning: 'https://www.figma.com/api/mcp/asset/688d189e-a4d9-4ea4-83f8-af2ec09fe061.png',
  wave: 'https://www.figma.com/api/mcp/asset/2ff39def-8e47-49c0-b6c6-b3e8e33b1d60.svg',
  spotify: 'https://www.figma.com/api/mcp/asset/2020ff34-bdf4-450b-9d8e-df6a0ccb271f.svg'
};

/* Box-shadow constants for the Win95 buttons */
const SHADOW_DEFAULT = 'inset 1px 1px 0px #ffffff, inset 2px 2px 0px #e0e0e0, inset -1px -1px 0px #505050, inset -2px -2px 0px #808080, 0 0 0 1px #000000';
const SHADOW_HOVER = 'inset 1px 1px 0px #ffffff, inset 2px 2px 0px #e0e0e0, inset -1px -1px 0px #505050, inset -2px -2px 0px #808080, 0 0 0 3px #000000';
const SHADOW_PRESSED = 'inset -1px -1px 0px #ffffff, inset -2px -2px 0px #e0e0e0, inset 1px 1px 0px #505050, inset 2px 2px 0px #808080, 0 0 0 1px #000000';
const BG_DEFAULT = 'linear-gradient(180deg, #dfdfdf 0%, #c0c0c0 100%)';
const BG_PRESSED = 'linear-gradient(180deg, #b0b0b0 0%, #a0a0a0 100%)';

function PixelCoffeeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black">
      <path d="M2 19h18v2H2v-2zM4 3h12v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V3zm2 2v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5H6zm10 2h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3V7zm2 2v2h1V9h-1z" />
    </svg>
  );
}

function PixelFolderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black">
      <path d="M2 4h8l2 2h10v14H2V4zm2 4v10h16V8H4z" />
    </svg>
  );
}

/* ── Draggable wrapper for decorative elements ── */
function Draggable({ children, style, driftStyle, id }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    setDragging(true);
  }, [offset]);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const combinedTransform = dragging
    ? `translate(${offset.x}px, ${offset.y}px)`
    : `translate(${offset.x}px, ${offset.y}px) ${driftStyle?.transform || ''}`;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        ...style,
        transform: combinedTransform,
        transition: dragging ? 'none' : (driftStyle?.transition || 'transform 0.45s ease'),
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        pointerEvents: 'auto',
        userSelect: 'none',
        zIndex: dragging ? 50 : (style?.zIndex || 35),
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage({ onBrowseTemplates }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Mouse movement parallax for desktop
  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x, y });
  }, []);

  // Per-element parallax drift calculation
  const drift = (dx, dy, rotate = 0) => ({
    transform: `translate(${mouse.x * dx}px, ${mouse.y * dy}px) rotate(${mouse.x * rotate}deg)`,
    transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#fafafa',
        overflow: 'hidden',
        fontFamily: "'Arial Narrow', 'Arial', sans-serif",
      }}
    >
      {/* ── MOBILE VIEWPORT LAYOUT (< 640px) matching reference screenshot ── */}
      <div className="block sm:hidden w-full h-full relative select-none">
        {/* 1. ?????? text (Top Left) */}
        <Draggable id="m-question" driftStyle={drift(24, 16, -4)} style={{ position: 'absolute', left: '7%', top: '6%' }}>
          <span style={{ color: '#1d19ea', fontSize: '32px', fontWeight: 400, lineHeight: 1 }}>
            ??????
          </span>
        </Draggable>

        {/* 2. CD Disc (Top Right) */}
        <Draggable id="m-disc" driftStyle={drift(-28, -18, 6)} style={{ position: 'absolute', right: '6%', top: '5%' }}>
          <img src={assets.disc} alt="" draggable={false} style={{ width: '75px', height: 'auto', objectFit: 'contain' }} />
        </Draggable>

        {/* 3. Warning Icon (Upper Center) */}
        <Draggable id="m-warning" driftStyle={drift(20, 30, 5)} style={{ position: 'absolute', left: '26%', top: '25%' }}>
          <img src={assets.warning} alt="" draggable={false} style={{ width: '64px', height: 'auto', objectFit: 'contain' }} />
        </Draggable>

        {/* 4. Center Title (Two Lines) + Subtitle */}
        <div
          style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            transform: `translateX(-50%) translate(${mouse.x * 6}px, ${mouse.y * 5}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '92%',
            zIndex: 10,
            transition: 'transform 0.15s ease-out',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(44px, 12.5vw, 62px)',
              color: '#1d19ea',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              fontFamily: "'Arial Narrow', 'Arial', sans-serif",
            }}
          >
            create your own
            <br />
            (custom id)
          </h1>

          <div className="relative flex items-center justify-center mt-3 z-30 pointer-events-auto">
            <a
              href="https://www.instagram.com/shuisbored/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                margin: 0,
                fontSize: '22px',
                color: '#12ba10',
                fontWeight: 400,
                lineHeight: 1,
                fontFamily: "'Arial Narrow', 'Arial', sans-serif",
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              className="hover:underline"
            >
              made by @shuisbored
            </a>
          </div>
        </div>

        {/* 5. Pixel Glasses (Right edge of Subtitle) */}
        <Draggable id="m-glasses" driftStyle={drift(-30, -14, -5)} style={{ position: 'absolute', right: '3%', top: '48%' }}>
          <img src={assets.object} alt="" draggable={false} style={{ width: '48px', height: 'auto', objectFit: 'contain' }} />
        </Draggable>

        {/* 6. Sparkle / Star (Middle Left) */}
        <Draggable id="m-star" driftStyle={drift(28, 24, 4)} style={{ position: 'absolute', left: '4%', top: '56%' }}>
          <img src={assets.star} alt="" draggable={false} style={{ width: '68px', height: 'auto', objectFit: 'contain' }} />
        </Draggable>

        {/* 7. Stacked Win95 Buttons (Middle Lower Center) */}
        <div
          style={{
            position: 'absolute',
            top: '61%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            zIndex: 30,
            width: '210px',
          }}
        >
          <button
            onClick={(e) => {
              playRetroClickSound();
              if (onBrowseTemplates) onBrowseTemplates(e);
            }}
            style={{
              width: '100%',
              height: '48px',
              border: 'none',
              background: BG_DEFAULT,
              color: 'black',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Arial Narrow', 'Arial', sans-serif",
              boxShadow: SHADOW_DEFAULT,
              userSelect: 'none',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_PRESSED;
              e.currentTarget.style.background = BG_PRESSED;
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_DEFAULT;
              e.currentTarget.style.background = BG_DEFAULT;
            }}
          >
            <PixelFolderIcon /> browse templates
          </button>

          <a
            href="https://buymeacoffee.com/shuisbored"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playRetroClickSound()}
            style={{
              width: '100%',
              height: '48px',
              border: 'none',
              background: BG_DEFAULT,
              color: 'black',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Arial Narrow', 'Arial', sans-serif",
              textDecoration: 'none',
              boxShadow: SHADOW_DEFAULT,
              userSelect: 'none',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_PRESSED;
              e.currentTarget.style.background = BG_PRESSED;
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_DEFAULT;
              e.currentTarget.style.background = BG_DEFAULT;
            }}
          >
            <PixelCoffeeIcon /> buy me a coffee
          </a>
        </div>

        {/* 8. Coffee Mug (Bottom Left) */}
        <Draggable id="m-mug" driftStyle={drift(14, 10, -2)} style={{ position: 'absolute', left: '10%', bottom: '11%' }}>
          <img src={assets.mug} alt="" draggable={false} style={{ width: '46px', height: 'auto', objectFit: 'contain' }} />
        </Draggable>

        {/* 9. Spotify + Soundwave (Bottom Right) */}
        <Draggable id="m-spotify" driftStyle={drift(-10, 8, 1)} style={{ position: 'absolute', right: '5%', bottom: '7%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
            <img src={assets.spotify} alt="" draggable={false} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <img src={assets.wave} alt="" draggable={false} style={{ width: '135px', height: '32px', objectFit: 'contain' }} />
          </div>
        </Draggable>
      </div>

      {/* ── DESKTOP VIEWPORT LAYOUT (>= 640px) ── */}
      <div className="hidden sm:flex absolute inset-0 items-center justify-center">
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1280px',
            aspectRatio: '1280 / 800',
            maxHeight: '100vh',
          }}
        >
          {/* 1. ?????? text */}
          <Draggable
            id="question"
            driftStyle={drift(6, 3, -1.5)}
            style={{
              position: 'absolute',
              left: '9%',
              top: '5.75%',
            }}
          >
            <span
              style={{
                color: '#1d19ea',
                fontSize: 'clamp(24px, 3.4vw, 44px)',
                fontWeight: 400,
                lineHeight: 1,
                pointerEvents: 'none',
              }}
            >
              ??????
            </span>
          </Draggable>

          {/* 2. Sparkle / Star */}
          <Draggable
            id="star"
            driftStyle={drift(4, 7, 1)}
            style={{
              position: 'absolute',
              left: '30%',
              top: '14.75%',
            }}
          >
            <img
              src={assets.star}
              alt=""
              draggable={false}
              style={{
                width: 'clamp(60px, 10.8vw, 138px)',
                height: 'auto',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </Draggable>

          {/* 3. CD Disc */}
          <Draggable
            id="disc"
            driftStyle={drift(-5, -3, 2)}
            style={{
              position: 'absolute',
              right: '5.5%',
              top: '11.4%',
            }}
          >
            <img
              src={assets.disc}
              alt=""
              draggable={false}
              style={{
                width: 'clamp(60px, 11.25vw, 144px)',
                height: 'auto',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </Draggable>

          {/* 4. Coffee Mug */}
          <Draggable
            id="mug"
            driftStyle={drift(7, 4, -1)}
            style={{
              position: 'absolute',
              left: '6.3%',
              top: '38.25%',
            }}
          >
            <img
              src={assets.mug}
              alt=""
              draggable={false}
              style={{
                width: 'clamp(50px, 9.5vw, 122px)',
                height: 'auto',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </Draggable>

          {/* 5. Main Title (not draggable) */}
          <h1
            style={{
              position: 'absolute',
              left: '50%',
              top: '40.25%',
              transform: `translateX(-50%) translate(${mouse.x * 1.5}px, ${mouse.y * 1}px)`,
              fontSize: 'clamp(36px, 7.5vw, 96px)',
              color: '#1d19ea',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              margin: 0,
              fontFamily: "'Arial Narrow', 'Arial', sans-serif",
              transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              zIndex: 10,
            }}
          >
            create your own (custom id)
          </h1>

          {/* 6. Subtitle (clickable link to Instagram) */}
          <a
            href="https://www.instagram.com/shuisbored/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              left: '50%',
              top: '53.5%',
              transform: `translateX(-50%) translate(${mouse.x * 2}px, ${mouse.y * 1.5}px)`,
              fontSize: 'clamp(16px, 2.2vw, 28px)',
              color: '#12ba10',
              fontWeight: 400,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              userSelect: 'none',
              margin: 0,
              fontFamily: "'Arial Narrow', 'Arial', sans-serif",
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              zIndex: 30,
              pointerEvents: 'auto',
            }}
            className="hover:underline"
          >
            made by @shuisbored
          </a>

          {/* 7. Browse Templates button (not draggable) */}
          <button
            onClick={(e) => {
              playRetroClickSound();
              if (onBrowseTemplates) onBrowseTemplates(e);
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '62.6%',
              transform: 'translateX(-50%)',
              width: 'clamp(170px, 16.5vw, 220px)',
              height: 'clamp(40px, 4.1vw, 53px)',
              borderRadius: 0,
              border: 'none',
              background: BG_DEFAULT,
              color: 'black',
              fontSize: 'clamp(14px, 1.56vw, 20px)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Arial Narrow', 'Arial', sans-serif",
              boxShadow: SHADOW_DEFAULT,
              transition: 'box-shadow 0.1s ease, transform 0.05s ease, background 0.05s ease',
              zIndex: 20,
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_HOVER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_DEFAULT;
              e.currentTarget.style.background = BG_DEFAULT;
              e.currentTarget.style.transform = 'translateX(-50%)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_PRESSED;
              e.currentTarget.style.background = BG_PRESSED;
              e.currentTarget.style.transform = 'translateX(-50%) translate(1px, 1px)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_HOVER;
              e.currentTarget.style.background = BG_DEFAULT;
              e.currentTarget.style.transform = 'translateX(-50%)';
            }}
          >
            <PixelFolderIcon /> browse templates
          </button>

          {/* 8. Buy Me a Coffee (not draggable) */}
          <a
            href="https://buymeacoffee.com/shuisbored"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playRetroClickSound()}
            style={{
              position: 'absolute',
              left: '50%',
              top: '70.9%',
              transform: 'translateX(-50%)',
              width: 'clamp(170px, 16.5vw, 220px)',
              height: 'clamp(40px, 4.1vw, 53px)',
              borderRadius: 0,
              border: 'none',
              background: BG_DEFAULT,
              color: 'black',
              fontSize: 'clamp(14px, 1.56vw, 20px)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Arial Narrow', 'Arial', sans-serif",
              textDecoration: 'none',
              boxShadow: SHADOW_DEFAULT,
              transition: 'box-shadow 0.1s ease, transform 0.05s ease, background 0.05s ease',
              zIndex: 20,
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_HOVER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_DEFAULT;
              e.currentTarget.style.background = BG_DEFAULT;
              e.currentTarget.style.transform = 'translateX(-50%)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_PRESSED;
              e.currentTarget.style.background = BG_PRESSED;
              e.currentTarget.style.transform = 'translateX(-50%) translate(1px, 1px)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = SHADOW_HOVER;
              e.currentTarget.style.background = BG_DEFAULT;
              e.currentTarget.style.transform = 'translateX(-50%)';
            }}
          >
            <PixelCoffeeIcon /> buy me a coffee
          </a>

          {/* 9. Warning Icon */}
          <Draggable
            id="warning"
            driftStyle={drift(5, 8, 1.5)}
            style={{
              position: 'absolute',
              left: '4%',
              top: '66.25%',
            }}
          >
            <img
              src={assets.warning}
              alt=""
              draggable={false}
              style={{
                width: 'clamp(45px, 7.2vw, 92px)',
                height: 'auto',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </Draggable>

          {/* 10. Pixel Glasses */}
          <Draggable
            id="glasses"
            driftStyle={drift(-6, -2, -1)}
            style={{
              position: 'absolute',
              right: '5%',
              top: '67.75%',
            }}
          >
            <img
              src={assets.object}
              alt=""
              draggable={false}
              style={{
                width: 'clamp(55px, 8.8vw, 113px)',
                height: 'auto',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </Draggable>

          {/* 11. Spotify + Soundwave */}
          <Draggable
            id="spotify"
            driftStyle={drift(3, 5, 0.5)}
            style={{
              position: 'absolute',
              left: '50%',
              top: '85.6%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                pointerEvents: 'none',
              }}
            >
              <img
                src={assets.spotify}
                alt=""
                draggable={false}
                style={{
                  width: 'clamp(24px, 3.1vw, 40px)',
                  height: 'clamp(24px, 3.1vw, 40px)',
                  objectFit: 'contain',
                }}
              />
              <img
                src={assets.wave}
                alt=""
                draggable={false}
                style={{
                  width: 'clamp(100px, 14.8vw, 190px)',
                  height: 'clamp(24px, 3.1vw, 40px)',
                  objectFit: 'contain',
                }}
              />
            </div>
          </Draggable>
        </div>
      </div>
    </div>
  );
}
