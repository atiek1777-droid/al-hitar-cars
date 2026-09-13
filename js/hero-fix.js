(function () {
  "use strict";
  function prepareHeroVideo() {
    var videos = document.querySelectorAll(".hero-media video");
    videos.forEach(function (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.addEventListener("canplay", function () {
        video.classList.add("is-ready");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") playPromise.catch(function(){});
      }, { once: true });
      video.load();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prepareHeroVideo, { once: true });
  else prepareHeroVideo();
})();