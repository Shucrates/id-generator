import { loadImage, drawRoundedRect } from './imageUtils';
import { drawQRCode } from './idGenerator';
import { ensureFontsLoaded } from './fontLoader';

/**
 * HTML5 Canvas renderer utilizing provided default & custom template images
 * Configured for maximum print-quality resolution & crisp vector subpixel text smoothing
 */
export async function renderCardCanvas({
  canvas,
  template,
  userData,
  croppedPhotoUrl,
  side = 'front',
  scale = 2,
  isCustomMode = false,
  isEditingName = false,
  backVersion = 'oscorp-symbol', // 'oscorp-symbol' | 'custom-qr'
  showCuttingGuides = false
}) {
  if (!canvas || !template) return;

  await ensureFontsLoaded();

  const ctx = canvas.getContext('2d', { alpha: true });
  // Base dimensions (1515 x 2400)
  const baseW = template.cardWidth || 1515;
  const baseH = template.cardHeight || 2400;

  // Render at high resolution scale (e.g. 2x = 3030 x 4800 pixels)
  canvas.width = baseW * scale;
  canvas.height = baseH * scale;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // High quality image smoothing settings for ultra crisp downscaling & scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.scale(scale, scale);

  // Rounded card corners clip path
  const cardRadius = 40;
  drawRoundedRect(ctx, 0, 0, baseW, baseH, cardRadius);
  ctx.clip();

  // Select appropriate background template image based on page mode, card side, back version, and notch guide toggle
  let bgUrl = '';
  if (side === 'front') {
    if (!isCustomMode) {
      bgUrl = showCuttingGuides
        ? '/richard-parker-default-front-notch.png'
        : '/richard-parker-default-front.png';
    } else {
      bgUrl = showCuttingGuides
        ? '/oscorp-custom-front-clean-notch.png'
        : '/oscorp-custom-front-clean.png';
    }
  } else {
    // Back Side Selection
    if (backVersion === 'oscorp-symbol') {
      bgUrl = showCuttingGuides
        ? '/oscorp-back-symbol-notch.png'
        : '/oscorp-back-symbol.png';
    } else {
      // Custom QR version (clean template where dynamic QR is rendered)
      bgUrl = showCuttingGuides
        ? '/oscorp-back-qr-notch.png'
        : (isCustomMode ? '/oscorp-custom-back.png' : '/richard-parker-default-back.png');
    }
  }

  const bgImg = await loadImage(bgUrl);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, baseW, baseH);
  }

  // FRONT SIDE DYNAMIC OVERLAYS
  if (side === 'front') {
    if (isCustomMode) {
      // 1. Draw User Photo if uploaded (Ratio 752x940: W=752, H=940)
      if (croppedPhotoUrl) {
        const photoImg = await loadImage(croppedPhotoUrl);
        if (photoImg) {
          const photoW = 752;
          const photoH = 940;
          const photoX = 401;
          const photoY = 910;

          ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
        }
      }

      // 2. Draw User Name or Reduced-Opacity Placeholder
      const nameVal = userData.name;

      ctx.font = "600 105px 'Baskerville', 'Baskerville Old Face', 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // When actively editing the inline HTML input, hide canvas text to prevent duplicate overlap
      if (!isEditingName) {
        if (nameVal && nameVal.trim() !== '') {
          ctx.fillStyle = "#000000";
          ctx.globalAlpha = 1.0;
          ctx.fillText(nameVal, baseW / 2, 2015);
        } else {
          ctx.fillStyle = "#000000";
          ctx.globalAlpha = 0.35; // Reduced opacity placeholder when idle and empty
          ctx.fillText("Add your name", baseW / 2, 2015);
          ctx.globalAlpha = 1.0;
        }
      }
    }
  }

  // BACK SIDE DYNAMIC OVERLAYS (Applies when QR Code version is selected)
  if (side === 'back' && backVersion === 'custom-qr') {
    const qrUrl = userData.qrUrl || template.defaultValues?.qrUrl || "https://oscorp.com/verify/A00473";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(800, 1460, 420, 420); // White background for custom QR code

    await drawQRCode(ctx, qrUrl, 800, 1460, 420, "#000000");
  }

  ctx.restore();
}
