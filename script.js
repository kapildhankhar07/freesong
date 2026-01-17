const reels = document.getElementById("reels");
const playlistScreen = document.getElementById("playlistScreen");
const allSongsScreen = document.getElementById("allSongsScreen");
const audio = document.getElementById("audio");

const playPause = document.getElementById("playPause");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const homeBtn = document.getElementById("homeBtn");
const playlistBtn = document.getElementById("playlistBtn");
const allSongsBtn = document.getElementById("allSongsBtn");
const searchInput = document.getElementById("searchInput");

let allSongs = [];
let activeSongs = [];
let currentIndex = 0;
let isPlaying = true;

/* LOAD SONGS */
fetch("songs.json")
  .then(res => res.json())
  .then(data => {
    allSongs = data;
    loadHome();
  });

/* HOME = RANDOM PLAY */
function loadHome() {
  activeSongs = shuffle([...allSongs]);
  currentIndex = 0;
  renderReel(currentIndex);
  showReels();
}

/* RENDER SINGLE SONG */
function renderReel(index) {
  reels.innerHTML = "";
  const song = activeSongs[index];
  if (!song) return;

  reels.innerHTML = `
    <div class="reel">
      <img loading="lazy" src="${song.image}">
      <h2>${song.songName}</h2>
      <p>${song.artist}</p>
    </div>
  `;

  playSong(index);
}

/* FAST AUDIO PLAY */
function playSong(index) {
  currentIndex = index;
  audio.pause();
  audio.src = activeSongs[index].audio;
  audio.load();
  audio.play().catch(() => {});
  isPlaying = true;
  playPause.textContent = "⏸";
}

/* SWIPE CONTROL */
let startY = 0;
reels.addEventListener("touchstart", e => {
  startY = e.touches[0].clientY;
});
reels.addEventListener("touchend", e => {
  const endY = e.changedTouches[0].clientY;
  if (startY - endY > 50) nextSong();
  if (endY - startY > 50) prevSong();
});

/* NEXT / PREV */
function nextSong() {
  currentIndex++;
  if (currentIndex >= activeSongs.length) {
    activeSongs = shuffle([...allSongs]);
    currentIndex = 0;
  }
  renderReel(currentIndex);
}

function prevSong() {
  currentIndex =
    (currentIndex - 1 + activeSongs.length) % activeSongs.length;
  renderReel(currentIndex);
}

/* PLAYER CONTROLS */
playPause.onclick = () => {
  if (isPlaying) {
    audio.pause();
    playPause.textContent = "▶";
  } else {
    audio.play();
    playPause.textContent = "⏸";
  }
  isPlaying = !isPlaying;
};

/* PROGRESS */
audio.ontimeupdate = () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = format(audio.currentTime);
  durationEl.textContent = format(audio.duration);
};

progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};

/* AUTO NEXT */
audio.onended = nextSong;

/* PLAYLIST SCREEN (UNCHANGED LOGIC) */
playlistBtn.onclick = () => {
  showScreen(playlistScreen);
  playlistScreen.innerHTML = "";

  const set = new Set();
  allSongs.forEach(s => s.playlists.forEach(p => set.add(p)));

  set.forEach(name => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.textContent = name;
    div.onclick = () => {
      activeSongs = allSongs.filter(s => s.playlists.includes(name));
      currentIndex = 0;
      renderReel(0);
      showReels();
    };
    playlistScreen.appendChild(div);
  });
};

/* ALL SONGS (FIXED ✅) */
allSongsBtn.onclick = () => {
  showScreen(allSongsScreen);
  allSongsScreen.innerHTML = "";

  allSongs.forEach(song => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.textContent = `${song.songName} – ${song.artist}`;

    div.onclick = () => {
      // 🔥 FIRST play clicked song, THEN random
      const rest = allSongs.filter(s => s !== song);
      activeSongs = [song, ...shuffle(rest)];
      currentIndex = 0;
      renderReel(0);
      showReels();
    };

    allSongsScreen.appendChild(div);
  });
};

/* SEARCH */
searchInput.oninput = () => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) return loadHome();

  activeSongs = allSongs.filter(s =>
    s.songName.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)
  );

  if (activeSongs.length) {
    currentIndex = 0;
    renderReel(0);
  }
};

/* HOME */
homeBtn.onclick = loadHome;

/* HELPERS */
function showScreen(screen) {
  reels.classList.add("hidden");
  playlistScreen.classList.add("hidden");
  allSongsScreen.classList.add("hidden");
  screen.classList.remove("hidden");
}

function showReels() {
  reels.classList.remove("hidden");
  playlistScreen.classList.add("hidden");
  allSongsScreen.classList.add("hidden");
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function format(t) {
  if (!t) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
