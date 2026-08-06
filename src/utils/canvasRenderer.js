import { loadImage, drawRoundedRect } from './imageUtils';
import { drawQRCode } from './idGenerator';
import { ensureFontsLoaded } from './fontLoader';

/**
 * HTML5 Canvas renderer utilizing provided default & custom template images
 */
export async function renderCardCanvas({
  canvas,
  template,
  userData,
  croppedPhotoUrl,
  side = 'front',
  scale = 1,
  isCustomMode = false,
  isEditingName = false
}) {
  if (!canvas || !template) return;

  await ensureFontsLoaded();

  const ctx = canvas.getContext('2d', { alpha: true });
  // Base dimensions (638 x 1000)
  const baseW = template.cardWidth || 638;
  const baseH = template.cardHeight || 1000;

  canvas.width = baseW * scale;
  canvas.height = baseH * scale;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);

  // Rounded card corners clip path
  const cardRadius = 20;
  drawRoundedRect(ctx, 0, 0, baseW, baseH, cardRadius);
  ctx.clip();

  // Select appropriate background template image based on page mode and card side
  let bgUrl = '';
  if (!isCustomMode) {
    bgUrl = side === 'front' ? '/richard-parker-default-front.png' : '/richard-parker-default-back.png';
  } else {
    bgUrl = side === 'front' ? '/oscorp-custom-front-clean.png' : '/oscorp-custom-back.png';
  }

  const bgImg = await loadImage(bgUrl);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, baseW, baseH);
  }

  // Draw dynamic customizer overlays ONLY when in Custom Mode
  if (isCustomMode) {
    if (side === 'front') {
      // 1. Draw User Photo if uploaded (Ratio 260x322: W=752, H=940)
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
    } else if (side === 'back') {
      // 3. Draw QR Code on Back Side if custom url set (Centered over placeholder text: X=794, Y=1534, W=380, H=380)
      const qrUrl = userData.qrUrl;
      const defaultQr = template.defaultValues?.qrUrl;
      if (qrUrl && qrUrl !== defaultQr) {
        ctx.fillStyle = "#fefefe";
        ctx.fillRect(800, 1460, 420, 420); // White background for QR code

        await drawQRCode(ctx, qrUrl, 800, 1460, 420, "#000000");
      }
    }
  }

  ctx.restore();
}
