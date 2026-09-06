import { loadImage, drawRoundedRect } from './imageUtils';
import { drawQRCode, drawPDF417 } from './idGenerator';
import { ensureFontsLoaded } from './fontLoader';

// Helper for generating lightweight 3-5% film grain pattern
let grainPatternCanvas = null;
function getFilmGrainPattern(ctx) {
  if (!grainPatternCanvas) {
    grainPatternCanvas = document.createElement('canvas');
    grainPatternCanvas.width = 128;
    grainPatternCanvas.height = 128;
    const gCtx = grainPatternCanvas.getContext('2d');
    const imgData = gCtx.createImageData(128, 128);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = Math.floor(Math.random() * 12 + 6); // ~3-5% grain alpha
    }
    gCtx.putImageData(imgData, 0, 0);
  }
  return ctx.createPattern(grainPatternCanvas, 'repeat');
}

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
  editingField = null,
  backVersion = 'oscorp-symbol', // 'oscorp-symbol' | 'custom-qr'
  showCuttingGuides = false,
  applyTvaFilter = true,
  tvaFilterIntensity = 45
}) {
  if (!canvas || !template) return;

  await ensureFontsLoaded();

  const ctx = canvas.getContext('2d', { alpha: true });
  // Base dimensions (1515 x 2400 for portrait cards, 1024 x 645 for landscape)
  const baseW = template.cardWidth || 1515;
  const baseH = template.cardHeight || 2400;

  // Render at high resolution scale (e.g. 2x)
  canvas.width = baseW * scale;
  canvas.height = baseH * scale;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // High quality image smoothing settings for ultra crisp downscaling & scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.scale(scale, scale);

  // Rounded card corners clip path
  const isLandscape = baseW > baseH;
  const cardRadius = isLandscape ? 32 : 40;
  drawRoundedRect(ctx, 0, 0, baseW, baseH, cardRadius);
  ctx.clip();

  // Select appropriate background template image based on template, card side, back version, and notch guide toggle
  let bgUrl = '';
  if (template.id === 'mclovin-license') {
    if (side === 'front') {
      bgUrl = !isCustomMode ? '/mclovin-default-front.png' : '/mclovin-custom-front.png';
    } else {
      bgUrl = !isCustomMode ? '/mclovin-default-back.png' : '/mclovin-custom-back.png';
    }
  } else if (template.id === 'loki-tva-id') {
    if (side === 'front') {
      bgUrl = !isCustomMode ? '/tva-loki-default-front.png?v=2' : '/tva-loki-custom-front.png';
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
      if (template.id === 'mclovin-license') {
        // 1. Draw User Photo if uploaded (Ratio 313x370: W=313, H=370 at X=25, Y=25)
        if (croppedPhotoUrl) {
          const photoImg = await loadImage(croppedPhotoUrl);
          if (photoImg) {
            const photoX = 24;
            const photoY = 24;
            const photoW = 314;
            const photoH = 354;
            const photoRadius = 5;

            ctx.save();
            drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
            ctx.clip();

            // Cover aspect fill to prevent stretching
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
            ctx.restore();
          }
        }

        ctx.save();
        ctx.fillStyle = "#1A1A1A";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        // 2. NUMBER (e.g. 01-47-87441) - Open Sans Condensed 750 with stroke thickness & slight spacing
        if (editingField !== 'licenseNumber') {
          const numVal = userData.licenseNumber || "01-47-87441";
          ctx.font = "750 47.5px 'Open Sans Condensed', 'Open Sans', sans-serif";
          ctx.letterSpacing = "1.2px";
          ctx.strokeStyle = "#1A1A1A";
          ctx.lineWidth = 0.8;
          ctx.lineJoin = "round";
          ctx.strokeText(numVal, 479, 174);
          ctx.fillText(numVal, 479, 174);
          ctx.letterSpacing = "0px";
        }

        // 3. DOB & EXP - Open Sans Condensed 750 with stroke thickness
        const dobVal = userData.dob || "06/03/1981";
        const expVal = userData.exp || "06/03/2008";
        ctx.font = "750 48px 'Open Sans Condensed', 'Open Sans', sans-serif";
        ctx.letterSpacing = "1.0px";
        ctx.strokeStyle = "#1A1A1A";
        ctx.lineWidth = 0.7;
        ctx.lineJoin = "round";
        if (editingField !== 'dob') {
          ctx.strokeText(dobVal, 424, 239);
          ctx.fillText(dobVal, 424, 239);
        }
        if (editingField !== 'exp') {
          ctx.strokeText(expVal, 737, 239);
          ctx.fillText(expVal, 737, 239);
        }
        ctx.letterSpacing = "0px";

        // 4. Details Row: HT, WT, HAIR, EYES, SEX, CTY - Open Sans 750 (slightly thicker)
        ctx.font = "750 24px 'Open Sans', 'Inter', sans-serif";
        ctx.strokeStyle = "#1A1A1A";
        ctx.lineWidth = 0.4;
        ctx.lineJoin = "round";

        const htVal = (userData.ht || "5-10").substring(0, 6);
        const wtVal = (userData.wt || "150").substring(0, 7);
        const hairVal = (userData.hair || "BRO").substring(0, 3).toUpperCase();
        const eyesVal = (userData.eyes || "BRO").substring(0, 3).toUpperCase();
        const sexVal = (userData.sex || "M").substring(0, 4).toUpperCase();
        const ctyVal = String(userData.cty ?? "0").substring(0, 1);

        if (editingField !== 'ht') {
          ctx.strokeText(htVal, 363, 297);
          ctx.fillText(htVal, 363, 297);
        }
        if (editingField !== 'wt') {
          ctx.strokeText(wtVal, 470, 297);
          ctx.fillText(wtVal, 470, 297);
        }
        if (editingField !== 'hair') {
          ctx.strokeText(hairVal, 575, 297);
          ctx.fillText(hairVal, 575, 297);
        }
        if (editingField !== 'eyes') {
          ctx.strokeText(eyesVal, 691, 297);
          ctx.fillText(eyesVal, 691, 297);
        }
        if (editingField !== 'sex') {
          const prevAlign = ctx.textAlign;
          ctx.textAlign = 'center';
          ctx.strokeText(sexVal, 826, 297);
          ctx.fillText(sexVal, 826, 297);
          ctx.textAlign = prevAlign;
        }
        if (editingField !== 'cty') {
          ctx.strokeText(ctyVal, 920, 297);
          ctx.fillText(ctyVal, 920, 297);
        }

        // 5. Details Row: ISSUE DATE, CLASS - Open Sans 750 (23.45px)
        ctx.font = "750 23.45px 'Open Sans', 'Inter', sans-serif";
        ctx.letterSpacing = "0.7px";
        ctx.strokeStyle = "#1A1A1A";
        ctx.lineWidth = 0.4;
        ctx.lineJoin = "round";

        const issueVal = userData.issueDate || "06/18/1998";
        const classVal = userData.class || "3";
        if (editingField !== 'issueDate') {
          ctx.strokeText(issueVal, 364, 378);
          ctx.fillText(issueVal, 364, 378);
        }
        if (editingField !== 'class') {
          ctx.strokeText(classVal, 580, 378);
          ctx.fillText(classVal, 580, 378);
        }
        ctx.letterSpacing = "0px";

        // 6. SIGNATURE
        if (userData.signatureDataUrl) {
          const sigImg = await loadImage(userData.signatureDataUrl);
          if (sigImg) {
            ctx.drawImage(sigImg, 380, 386, 248, 98);
          }
        } else {
          const isMcLovin = !userData.name || userData.name.trim().toLowerCase() === "mclovin";
          if (isMcLovin) {
            const defSigImg = await loadImage("/mclovin-default-signature.png");
            if (defSigImg) {
              ctx.drawImage(defSigImg, 405, 400, 180, 80);
            } else {
              ctx.font = "400 44px 'Photograph Signature', 'Cedarville Cursive', cursive";
              ctx.fillStyle = "#1A1A1A";
              ctx.fillText("McLovin", 418, 458);
            }
          } else {
            const sigName = userData.name.trim();
            let fontSize = 52;
            ctx.font = `400 ${fontSize}px 'Photograph Signature', 'Cedarville Cursive', cursive`;
            const measured = ctx.measureText(sigName).width;
            if (measured > 210) {
              fontSize = Math.max(26, Math.floor(52 * (210 / measured)));
              ctx.font = `400 ${fontSize}px 'Photograph Signature', 'Cedarville Cursive', cursive`;
            }
            ctx.fillStyle = "#1A1A1A";
            ctx.fillText(sigName, 410, 458);
          }
        }

        // 7. NAME & ADDRESS (Bottom Left) - Inter Bold (700 33px, slightly condensed)
        const nameVal = userData.name || "McLOVIN";
        const addr1Val = userData.address1 || "892 MOMONA ST";
        const addr2Val = userData.address2 || "HONOLULU, HI 96820";

        ctx.font = "700 33px 'Inter', sans-serif";
        ctx.letterSpacing = "-0.6px";
        if (editingField !== 'name') {
          ctx.fillText(nameVal, 25, 525.5);
        }
        if (editingField !== 'address1') {
          ctx.fillText(addr1Val, 25, 564.5);
        }
        if (editingField !== 'address2') {
          ctx.fillText(addr2Val, 25, 603.5);
        }
        ctx.letterSpacing = "0px";
        ctx.letterSpacing = "0px";

        ctx.restore();
      } else if (template.id === 'loki-tva-id') {
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
                // Cinematic base: Slight sepia (18%), reduced saturation (85%), gentle contrast (+10%), slightly lowered brightness (95%)
                const sepiaVal = (0.18 * intensityFactor).toFixed(2);
                const satVal = (1 - 0.15 * intensityFactor).toFixed(2);
                const contrastVal = (1 + 0.10 * intensityFactor).toFixed(2);
                const brightVal = (1 - 0.05 * intensityFactor).toFixed(2);

                ctx.filter = `sepia(${sepiaVal}) saturate(${satVal}) contrast(${contrastVal}) brightness(${brightVal})`;
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

              // Pass 1: Warm Amber Color Temperature (+22, #d69642) - Preserves Skin Tones
              ctx.globalAlpha = 0.22 * intensityFactor;
              ctx.globalCompositeOperation = 'color';
              ctx.fillStyle = '#d69642';
              ctx.fillRect(photoX, photoY, photoW, photoH);

              // Pass 2: Lifted Blacks (Faded Film Look)
              ctx.globalAlpha = 0.12 * intensityFactor;
              ctx.globalCompositeOperation = 'lighten';
              ctx.fillStyle = '#26201b';
              ctx.fillRect(photoX, photoY, photoW, photoH);

              // Pass 3: Soft Highlight Bloom
              ctx.save();
              ctx.globalAlpha = 0.22 * intensityFactor;
              try {
                const bloomBlur = Math.round(8 * intensityFactor * scale);
                ctx.filter = `blur(${bloomBlur}px) brightness(1.12) sepia(0.3)`;
              } catch (e) {}
              ctx.globalCompositeOperation = 'screen';
              ctx.drawImage(photoImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
              ctx.restore();

              // Pass 4: Subtle Dark Vignette (25-30% around edges)
              ctx.globalAlpha = 1.0;
              const centerX = photoX + photoW / 2;
              const centerY = photoY + photoH / 2;
              const maxRadius = Math.max(photoW, photoH) * 0.75;

              const vignetteGrad = ctx.createRadialGradient(
                centerX, centerY, maxRadius * 0.35,
                centerX, centerY, maxRadius
              );
              vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
              vignetteGrad.addColorStop(0.65, `rgba(15, 10, 5, ${0.15 * intensityFactor})`);
              vignetteGrad.addColorStop(1, `rgba(10, 5, 0, ${0.28 * intensityFactor})`);

              ctx.globalCompositeOperation = 'multiply';
              ctx.fillStyle = vignetteGrad;
              ctx.fillRect(photoX, photoY, photoW, photoH);

              // Pass 5: Very Light Film Grain (3-5%)
              const grainPattern = getFilmGrainPattern(ctx);
              if (grainPattern) {
                ctx.globalAlpha = 0.5 * intensityFactor;
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = grainPattern;
                ctx.fillRect(photoX, photoY, photoW, photoH);
              }

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

  // BACK SIDE DYNAMIC OVERLAYS
  if (side === 'back') {
    if (template.id === 'mclovin-license') {
      const mx = 137, my = 504, mw = 99, mh = 113;
      // 1. Mini Photo in bottom left (reflects user photo uploaded for front card)
      if (croppedPhotoUrl) {
        const miniPhotoImg = await loadImage(croppedPhotoUrl);
        if (miniPhotoImg) {
          ctx.save();
          drawRoundedRect(ctx, mx, my, mw, mh, 4);
          ctx.clip();

          const imgRatio = miniPhotoImg.width / miniPhotoImg.height;
          const targetRatio = mw / mh;
          let sx = 0, sy = 0, sw = miniPhotoImg.width, sh = miniPhotoImg.height;
          if (imgRatio > targetRatio) {
            sw = miniPhotoImg.height * targetRatio;
            sx = (miniPhotoImg.width - sw) / 2;
          } else {
            sh = miniPhotoImg.width / targetRatio;
            sy = (miniPhotoImg.height - sh) / 2;
          }
          ctx.drawImage(miniPhotoImg, sx, sy, sw, sh, mx, my, mw, mh);
          ctx.restore();
        }
      } else if (isCustomMode) {
        // Placeholder "ADD YOUR PHOTO" box in custom mode before image upload
        ctx.save();
        ctx.fillStyle = "#D9D9D9";
        drawRoundedRect(ctx, mx, my, mw, mh, 4);
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "800 21px 'Open Sans Condensed', 'Open Sans', sans-serif";
        ctx.letterSpacing = "0.5px";

        const centerX = mx + mw / 2;
        const centerY = my + mh / 2;
        ctx.fillText("ADD", centerX, centerY - 23);
        ctx.fillText("YOUR", centerX, centerY);
        ctx.fillText("PHOTO", centerX, centerY + 23);
        ctx.restore();
      }

      // 2. Dynamic Center PDF417 Barcode
      const pdf417Url = userData.pdf417Url || template.defaultValues?.pdf417Url || "https://id.patilshubham.me";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(244, 192, 572, 208); // Clean white base
      await drawPDF417(ctx, pdf417Url, 246, 194, 568, 204, "#000000");
    } else if (template.id !== 'loki-tva-id' && backVersion === 'custom-qr') {
      const qrUrl = userData.qrUrl || template.defaultValues?.qrUrl || "https://oscorp.com/verify/A00473";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(800, 1460, 420, 420); // White background for custom QR code

      await drawQRCode(ctx, qrUrl, 800, 1460, 420, "#000000");
    }
  }

  ctx.restore();
}

