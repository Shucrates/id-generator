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
  showCuttingGuides = false,
  applyTvaFilter = true,
  tvaFilterIntensity = 45
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
  if (template.id === 'loki-tva-id') {
    if (side === 'front') {
      bgUrl = !isCustomMode ? '/tva-loki-default-front.png' : '/tva-loki-custom-front.png';
    } else {
      bgUrl = '/tva-loki-back.png';
    }
  } else {
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
  }

  const bgImg = await loadImage(bgUrl);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, baseW, baseH);
  }

  // FRONT SIDE DYNAMIC OVERLAYS
  if (side === 'front') {
    if (isCustomMode) {
      if (template.id === 'loki-tva-id') {
        // Loki TVA Photo Box (Locked 260x338 ratio with 4px top/bottom inset: W=783, H=1000 at X=366, Y=1098)
        if (croppedPhotoUrl) {
          const photoImg = await loadImage(croppedPhotoUrl);
          if (photoImg) {
            const photoX = 366;
            const photoY = 1097;
            const photoW = 783;
            const photoH = 1010;
            const photoRadius = { topLeft: 24, topRight: 20, bottomRight: 8, bottomLeft: 8 };

            ctx.save();
            drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
            ctx.clip();

            const intensityFactor = applyTvaFilter ? (Math.min(Math.max(tvaFilterIntensity, 0), 100) / 100) : 0;

            if (applyTvaFilter && intensityFactor > 0) {
              try {
                const grayPercent = Math.round(intensityFactor * 90);
                const blurPx = (intensityFactor * 1.5 * scale).toFixed(1);
                ctx.filter = `grayscale(${grayPercent}%) sepia(${intensityFactor * 0.8}) contrast(0.88) brightness(1.02) blur(${blurPx}px)`;
              } catch (e) {}
            }

            // Aspect cover cropping logic: prevents image stretch under all circumstances
            const imgRatio = photoImg.width / photoImg.height;
            const targetRatio = photoW / photoH;
            let sx = 0, sy = 0, sw = photoImg.width, sh = photoImg.height;

            if (imgRatio > targetRatio) {
              sw = photoImg.height * targetRatio;
              sx = (photoImg.width - sw) / 2;
            } else {
              sh = photoImg.width / targetRatio;
              sy = (photoImg.height - sh) / 2;
            }

            ctx.drawImage(photoImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);

            if (applyTvaFilter && intensityFactor > 0) {
              ctx.filter = 'none';

              // Pass 1: Soft Analog Film Bloom Overlay (Diffuses sharp edges into soft film glow)
              ctx.save();
              ctx.globalAlpha = intensityFactor * 0.28;
              try {
                const bloomBlur = Math.round(10 * intensityFactor * scale);
                ctx.filter = `blur(${bloomBlur}px) brightness(1.08) sepia(0.6)`;
              } catch (e) {}
              ctx.globalCompositeOperation = 'screen';
              ctx.drawImage(photoImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
              ctx.restore();

              // Pass 2: Warm Vintage TVA Golden Orange-Yellowish Amber Tint (#ba8945)
              ctx.globalAlpha = intensityFactor * 0.72;
              ctx.globalCompositeOperation = 'color';
              ctx.fillStyle = '#ba8945';
              ctx.fillRect(photoX, photoY, photoW, photoH);

              // Pass 3: Soft Muted Sepia Shadow Multiply Blend
              ctx.globalCompositeOperation = 'multiply';
              ctx.fillStyle = 'rgba(55, 42, 32, 0.28)';
              ctx.fillRect(photoX, photoY, photoW, photoH);

              // Pass 4: Dark Radial Vintage Lens Vignette (Darkens edges & corners)
              ctx.globalAlpha = 1.0;
              const centerX = photoX + photoW / 2;
              const centerY = photoY + photoH / 2;
              const maxRadius = Math.max(photoW, photoH) * 0.72;

              const vignetteGrad = ctx.createRadialGradient(
                centerX, centerY, maxRadius * 0.25,
                centerX, centerY, maxRadius
              );
              vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
              vignetteGrad.addColorStop(0.55, `rgba(20, 15, 10, ${0.30 * intensityFactor})`);
              vignetteGrad.addColorStop(1, `rgba(10, 5, 0, ${0.72 * intensityFactor})`);

              ctx.globalCompositeOperation = 'multiply';
              ctx.fillStyle = vignetteGrad;
              ctx.fillRect(photoX, photoY, photoW, photoH);

              // Reset alpha and composite blend mode
              ctx.globalAlpha = 1.0;
              ctx.globalCompositeOperation = 'source-over';
            }

            ctx.restore();
          }
        }
      } else {
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
  }

  // BACK SIDE DYNAMIC OVERLAYS (Applies when QR Code version is selected on Oscorp card)
  if (side === 'back' && template.id !== 'loki-tva-id' && backVersion === 'custom-qr') {
    const qrUrl = userData.qrUrl || template.defaultValues?.qrUrl || "https://oscorp.com/verify/A00473";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(800, 1460, 420, 420); // White background for custom QR code

    await drawQRCode(ctx, qrUrl, 800, 1460, 420, "#000000");
  }

  ctx.restore();
}
