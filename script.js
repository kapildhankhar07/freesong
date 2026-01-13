const reels = document.getElementById("reels");
const playlistScreen = document.getElementById("playlistScreen");
const audio = document.getElementById("audio");

const playPause = document.getElementById("playPause");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const homeBtn = document.getElementById("homeBtn");
const playlistBtn = document.getElementById("playlistBtn");
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

/* HOME (RANDOM SONGS) */
function loadHome() {
  activeSongs = shuffle([...allSongs]);
  showReels();
}

/* SHOW REELS */
function showReels() {
  reels.innerHTML = "";
  reels.classList.remove("hidden");
  playlistScreen.classList.add("hidden");

  if (activeSongs.length === 0) {
    reels.innerHTML = "<p style='padding:20px'>No songs found</p>";
    audio.pause();
    return;
  }

  activeSongs.forEach(song => {
    const div = document.createElement("div");
    div.className = "reel";
    div.innerHTML = `
      <img src="${song.image}">
      <h2>${song.songName}</h2>
      <p>${song.artist}</p>
    `;
    reels.appendChild(div);
  });

  playSong(0);
}

/* AUTO PLAY ON SCROLL */
reels.addEventListener("scroll", () => {
  const index = Math.round(reels.scrollTop / reels.clientHeight);
  if (index !== currentIndex && activeSongs[index]) {
    playSong(index);
  }
});

/* PLAY SONG */
function playSong(index) {
  currentIndex = index;
  audio.src = activeSongs[index].audio;
  audio.play();
  isPlaying = true;
  playPause.textContent = "⏸";
}

/* PLAY / PAUSE */
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

/* TIMER + SEEK */
audio.ontimeupdate = () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = format(audio.currentTime);
  durationEl.textContent = format(audio.duration);
};

progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};

/* AUTO NEXT */
audio.onended = () => {
  if (currentIndex < activeSongs.length - 1) {
    currentIndex++;
    reels.children[currentIndex].scrollIntoView({ behavior: "smooth" });
    playSong(currentIndex);
  }
};

/* PLAYLIST BUTTON */
playlistBtn.onclick = () => {
  reels.classList.add("hidden");
  playlistScreen.classList.remove("hidden");
  playlistScreen.innerHTML = "";

  const playlistSet = new Set();
  allSongs.forEach(song => {
    song.playlists.forEach(p => playlistSet.add(p));
  });

  playlistSet.forEach(name => {
    const div = document.createElement("div");
    div.className = "playlist-item";
    div.textContent = name;
    div.onclick = () => loadPlaylist(name);
    playlistScreen.appendChild(div);
  });
};

/* LOAD PLAYLIST */
function loadPlaylist(name) {
  activeSongs = allSongs.filter(song =>
    song.playlists.includes(name)
  );
  showReels();
}

/* SEARCH */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();

  if (q === "") {
    loadHome();
    return;
  }

  activeSongs = allSongs.filter(song =>
    song.songName.toLowerCase().includes(q) ||
    song.artist.toLowerCase().includes(q) ||
    song.playlists.some(p => p.toLowerCase().includes(q))
  );

  showReels();
});

/* HOME BUTTON */
homeBtn.onclick = loadHome;

/* UTILS */
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function format(t) {
  if (!t) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
