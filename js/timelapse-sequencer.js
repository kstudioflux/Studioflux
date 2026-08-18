// Plays a 3-clip construction timelapse (foundation → walls → roof) back to
// back on any <video data-timelapse> element, looping seamlessly.
(function () {
  var CLIPS = [
    "../img/construction-1-foundation.mp4",
    "../img/construction-2-walls.mp4",
    "../img/construction-3-roof.mp4",
  ];

  document.querySelectorAll("[data-timelapse]").forEach(function (video) {
    var i = 0;
    function playNext() {
      video.src = CLIPS[i];
      video.load();
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
      i = (i + 1) % CLIPS.length;
    }
    video.addEventListener("ended", playNext);
    playNext();
  });
})();
