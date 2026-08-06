// Random ID Generator & Canvas Barcode / QR Code Drawing Utilities

export function generateRandomID(prefix = 'EMP') {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${digits}`;
}

// Render clean crisp barcode on canvas using Code-128 style pattern bars
export function drawBarcode(ctx, text, x, y, width, height, color = "#0f172a") {
  ctx.save();
  ctx.fillStyle = color;

  // Simple deterministic hash pattern based on input text string
  const str = String(text || "12345678");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  // Draw quiet zone background (subtle semi-transparent light backdrop for barcodes)
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(x, y, width, height);

  // Generate bar sequence
  const bars = [];
  // Guard start bar
  bars.push(3, 1, 1, 1);

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const w1 = (charCode % 3) + 1;
    const w2 = ((charCode * 7) % 3) + 1;
    const w3 = ((charCode * 13) % 3) + 1;
    bars.push(w1, 1, w2, 2, w3, 1);
  }
  // Guard stop bar
  bars.push(2, 1, 3, 2, 1);

  // Calculate total bar width units
  const totalUnits = bars.reduce((a, b) => a + b, 0);
  const padding = 12;
  const usableWidth = width - (padding * 2);
  const unitWidth = usableWidth / totalUnits;
  
  let currentX = x + padding;
  ctx.fillStyle = color;

  for (let i = 0; i < bars.length; i++) {
    const barW = bars[i] * unitWidth;
    if (i % 2 === 0) {
      // Draw bar
      ctx.fillRect(currentX, y + 8, barW, height - 24);
    }
    currentX += barW;
  }

  // Draw barcode text below bars
  ctx.fillStyle = color;
  ctx.font = "bold 12px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(str, x + width / 2, y + height - 4);

  ctx.restore();
}

import QRCode from 'qrcode';

// Render real scannable QR code on canvas asynchronously using qrcode library
export async function drawQRCode(ctx, text, x, y, size, color = "#000000") {
  ctx.save();
  const str = String(text || "https://oscorp.com");

  try {
    // Generate real scannable QR code Canvas
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, str, {
      width: size,
      margin: 1,
      color: {
        dark: color,
        light: '#ffffff'
      }
    });

    ctx.drawImage(qrCanvas, x, y, size, size);
  } catch (err) {
    console.error("QR Code generation error:", err);
    // Fallback static fill if error occurs
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
  }

  ctx.restore();
}
