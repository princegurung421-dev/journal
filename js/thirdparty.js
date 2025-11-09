(function(){
  const VIDEO_ID = '8O-1qB-fxjc'; 

  const playerContainerId = 'yt-player-iframe';
  const playBtnId = 'yt-play';
  const pauseBtnId = 'yt-pause';

  let player = null;
  let apiReady = false;

  // Load YouTube IFrame API
  function loadYouTubeAPI() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        apiReady = true;
        resolve();
        return;
      }
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = function() {
        apiReady = true;
        resolve();
      };
    });
  }

  async function createPlayer() {
    const container = document.getElementById(playerContainerId);
    if (!container) return;

    await loadYouTubeAPI();

    player = new YT.Player(playerContainerId, {
      height: '200',
      width: '320',
      videoId: VIDEO_ID,
      playerVars: {
        rel: 0,
        modestbranding: 1
      },
      events: {
        onReady: onPlayerReady,
        onError: function(e) { console.error('YouTube player error', e); }
      }
    });
  }

  function onPlayerReady() {
    const playBtn = document.getElementById(playBtnId);
    const pauseBtn = document.getElementById(pauseBtnId);

    if (playBtn) playBtn.addEventListener('click', () => {
      if (player && player.playVideo) player.playVideo();
    });
    if (pauseBtn) pauseBtn.addEventListener('click', () => {
      if (player && player.pauseVideo) player.pauseVideo();
    });
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPlayer);
  } else {
    createPlayer();
  }
})();
