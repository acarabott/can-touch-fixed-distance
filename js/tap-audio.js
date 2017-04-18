let audiobuffer;
audio.loadAudio('audio/click.mp3').then(buffer => audiobuffer = buffer);

window.addEventListener('touchstart', e => {
  audio.playSample(audiobuffer, 0, 0.2);
});

window.addEventListener('mousedown', e => {
  audio.playSample(audiobuffer, 0, 0.2);
});

