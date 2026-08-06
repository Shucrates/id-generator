// Helper utilities for canvas image loading, rounded clip paths, and default avatar generation

const imageCache = new Map();

export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      console.warn("Failed to load image at:", src);
      resolve(null);
    };
    img.src = src;
  });
}

// Draw path with rounded corners
export function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = typeof radius === 'number' ? radius : 8;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Default Richard Parker staff portrait generator (matching Oscorp staff photo)
export function getDefaultAvatarDataUrl() {
  const canvas = document.createElement('canvas');
  canvas.width = 308;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');

  // Studio portrait background
  const grad = ctx.createLinearGradient(0, 0, 0, 380);
  grad.addColorStop(0, "#d1d5db");
  grad.addColorStop(1, "#9ca3af");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 308, 380);

  // Hair
  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.arc(154, 150, 75, Math.PI, 0, false);
  ctx.fill();

  // Face shape
  ctx.fillStyle = "#e5c0a2";
  ctx.beginPath();
  ctx.ellipse(154, 175, 55, 68, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glasses frames
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 4;
  ctx.strokeRect(118, 155, 30, 22);
  ctx.strokeRect(160, 155, 30, 22);
  ctx.beginPath(); ctx.moveTo(148, 166); ctx.lineTo(160, 166); ctx.stroke();

  // Eyes
  ctx.fillStyle = "#1f2937";
  ctx.beginPath(); ctx.arc(133, 166, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(175, 166, 4, 0, Math.PI * 2); ctx.fill();

  // Nose / Mouth
  ctx.strokeStyle = "#9a6b4c";
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(154, 175); ctx.lineTo(150, 185); ctx.lineTo(158, 185); ctx.stroke();
  ctx.beginPath(); ctx.arc(154, 205, 15, 0.1, Math.PI - 0.1); ctx.stroke();

  // Shirt / Collar
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(70, 380);
  ctx.lineTo(110, 250);
  ctx.lineTo(154, 280);
  ctx.lineTo(198, 250);
  ctx.lineTo(238, 380);
  ctx.fill();

  // Tie
  ctx.fillStyle = "#4b5563";
  ctx.beginPath();
  ctx.moveTo(146, 275);
  ctx.lineTo(162, 275);
  ctx.lineTo(166, 380);
  ctx.lineTo(142, 380);
  ctx.fill();

  // Suit jacket
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.moveTo(0, 380); ctx.lineTo(70, 380); ctx.lineTo(110, 250); ctx.lineTo(70, 270); ctx.lineTo(0, 340); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(308, 380); ctx.lineTo(238, 380); ctx.lineTo(198, 250); ctx.lineTo(238, 270); ctx.lineTo(308, 340); ctx.fill();

  return canvas.toDataURL('image/png');
}

// Customizer Wireframe Photo Placeholder ("Upload your image" matching MacBook Air - 3)
export function getCustomizerPhotoPlaceholderDataUrl() {
  const canvas = document.createElement('canvas');
  canvas.width = 308;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');

  // Light grey background
  ctx.fillStyle = "#d4d4d8";
  ctx.fillRect(0, 0, 308, 380);

  // Upload Icon (Image icon + Plus circle)
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#000000";
  ctx.lineWidth = 4;

  // Outer image frame icon
  ctx.strokeRect(114, 120, 80, 65);
  // Mountains inside icon
  ctx.beginPath();
  ctx.moveTo(124, 175);
  ctx.lineTo(144, 145);
  ctx.lineTo(159, 165);
  ctx.lineTo(174, 140);
  ctx.lineTo(184, 175);
  ctx.stroke();

  // Plus circle badge
  ctx.beginPath();
  ctx.arc(174, 140, 14, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(168, 140); ctx.lineTo(180, 140); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(174, 134); ctx.lineTo(174, 146); ctx.stroke();

  // Text: "Upload your image"
  ctx.fillStyle = "#000000";
  ctx.font = "bold 24px 'Playfair Display', Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("Upload", 154, 235);
  ctx.fillText("your", 154, 268);
  ctx.fillText("image", 154, 301);

  return canvas.toDataURL('image/png');
}
