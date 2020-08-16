class Radio {
  constructor() {
    this.instance = new Audio();
  }

  changeVolume = (volume) => {
    this.instance.volume = volume;
  };

  play = (url) => {
    this.stop();

    try {
      this.instance.src = url;
      this.instance.play();
    } catch (error) {}
  };

  stop = () => {
    if (!this.instance.paused) {
      this.instance.pause();
    }
  };
}

const radio = new Radio();

if ('alt' in window) {
  window.alt.emit('radio:loaded');
  window.alt.on('radio:changeVolume', radio.changeVolume);
  window.alt.on('radio:play', radio.play);
  window.alt.on('radio:stop', radio.stop);
}
