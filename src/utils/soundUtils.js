// Real Audio MP3 Player for button and toggle clicks across the website
let clickAudio = null;

export function playRetroClickSound() {
  try {
    if (typeof window === 'undefined') return;

    if (!clickAudio) {
      clickAudio = new Audio('/click-sound.mp3');
      clickAudio.preload = 'auto';
    }

    // Clone or reset time to allow rapid overlapping button clicks
    const soundInstance = clickAudio.cloneNode();
    soundInstance.volume = 0.85;
    soundInstance.play().catch((err) => {
      // Ignore initial user gesture autoplay restrictions
    });
  } catch (err) {
    console.log('Audio playback error:', err);
  }
}
