const loadAudio = (url) => {
  return new Promise((resolve) => {
    const audio = document.createElement(`audio`);
    audio.src = url;

    audio.onloadeddata = (evt) => resolve(evt.target.response);
    audio.onerror = (evt) => resolve(evt.target.response);

    window.setTimeout(resolve, 60000);
  });
};

export default loadAudio;
