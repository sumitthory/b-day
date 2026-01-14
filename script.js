/**************** GLOBAL STATE ****************/
let secretWish = "";
let secretRating = 0;
let selectedGift = "";
let floatingTimer = null;
let giftRemoved = false;
let giftOpened = false;

/**************** PAGE LOGIC (UNCHANGED) ****************/
let current = 0;
const pages = document.querySelectorAll(".page");

function showPage(i){
  if(i < 0 || i >= pages.length) return;

  pages.forEach(p=>{
    p.classList.remove("active");
    p.classList.remove("cake-dark");
  });

  pages[i].classList.add("active");
  current = i;

  /* 🎂 Cake page dark mode */
  if(i === 4){
    pages[i].classList.add("cake-dark");
  }

  /* 🎵 Birthday song control */
  const cakeSong = document.getElementById("birthdaySong");
  if(cakeSong){
    if(i === 4 ){
      if(cakeSong.paused) cakeSong.play();
    } else {
      cakeSong.pause();
      cakeSong.currentTime = 0;
    }
  }

  updateGiftVisibility();
  stopFloating();
  handleFloating(i);
}
showPage(0);

pages.forEach(p=>{
  p.addEventListener("click",e=>{
    if(
      e.target.closest(
        ".flip-card," +
        ".music-card," +
        ".song-card," +
        ".mini-player," +
        "#seekBar," +
        ".wishCard," +
        ".cake-gif," +
        ".gift-3d," +
        ".review-hearts," +
        ".return-gifts," +
        ".gateway," +
        "button," +
        "video," +
        "input"
      )
    ) return;

    if(current < pages.length-1) showPage(current+1);
  });
});

/**************** FLOATING (USING YOUR LOGIC) ****************/
function handleFloating(i){
  if(!(i===0 || i===1 || i===5)) return;
  floatingTimer = setInterval(createFloating,1200);
}

function createFloating(){
  const el = document.createElement("div");
  el.className="effect";
  el.style.backgroundImage="url('assets/heart.gif')";
  el.style.left=Math.random()*90+"vw";
  el.style.top="100vh";
  document.getElementById("effects").appendChild(el);

  el.animate(
    [{transform:"translateY(0)",opacity:1},
     {transform:"translateY(-350px)",opacity:0}],
    {duration:6000,easing:"ease-out"}
  );

  setTimeout(()=>el.remove(),6000);
}

function stopFloating(){
  clearInterval(floatingTimer);
  document.querySelectorAll("#effects .effect").forEach(e=>e.remove());
}

/**************** FLIP ****************/
function flipCard(card){ card.classList.toggle("flipped"); }

/**************** MUSIC ****************/
const songs=["assets/song1.mp3","assets/song2.mp3","assets/song3.mp3"];
const player=document.getElementById("player");
function playSong(i){
  player.src = songs[i];
  player.load();              // 👈 force reload
  player.play().catch(()=>{}); // 👈 prevent mobile blocking
}

/**************** CAKE + WISH CARD ****************/
function cutCake(e){
  e.stopPropagation();
  cakeBurst();
}

function cakeBurst(){
  for(let i=0;i<25;i++){
    const el=document.createElement("div");
    el.className="effect";
    el.textContent=Math.random()>0.5?"💖":"🌸";
    el.style.left="50%";
    el.style.top="50%";
    document.getElementById("effects").appendChild(el);

    el.animate(
      [{transform:"translate(0,0)",opacity:1},
       {transform:`translate(${Math.random()*500-250}px,${Math.random()*500-250}px) rotate(360deg)`,opacity:0}],
      {duration:2400}
    );
    setTimeout(()=>el.remove(),2400);
  }
}

function openWishCard(e){
  e.stopPropagation();
  document.querySelector(".wishCard").classList.remove("hidden");
}

function sealWishUI(e){
  e.stopPropagation();
  const input = document.getElementById("wishInput");
  if(!input.value.trim()) return;
  secretWish = input.value.trim();
  cakeBurst();
  document.querySelector(".wishCard").classList.add("hidden");
}

/**************** GIFT ****************/
function updateGiftVisibility(){
  const content = document.querySelector(".surprise-content");
  if(!content) return;

  if(current === 5){
    if(giftOpened){
      content.style.display = "flex";
    } else {
      content.style.display = "none";
    }
  } else {
    content.style.display = "none";
    content.querySelectorAll("video").forEach(v=>{
      v.pause();
      v.currentTime = 0;
    });
  }
}

function openGift(e){
  e.stopPropagation();
  if(giftOpened) return;
  giftOpened = true;

  const gift = document.querySelector(".gift-3d");
  const content = document.querySelector(".surprise-content");

  gift.classList.add("open");
  content.style.display = "flex";

  content.querySelectorAll("video").forEach(v=>{
    v.muted = true;
    v.play();
  });

  setTimeout(()=>{
    if(gift && gift.parentNode){
      gift.parentNode.removeChild(gift);
    }
  },900);
}

/**************** REVIEW ****************/
function rate(n){
  secretRating=n;
  document.querySelectorAll(".review-hearts span")
    .forEach((h,i)=>h.classList.toggle("active",i<n));
}

/**************** GATEWAY ****************/
function selectGift(gift){
  selectedGift = gift;
  document.getElementById("gatewayPopup").classList.remove("hidden");
}

function goWhatsApp(){
  document.getElementById("gatewayPopup").classList.remove("hidden");
  window.__sendTarget = "whatsapp";
}

function sendViaWhatsApp(){
  document.getElementById("gatewayPopup").classList.add("hidden");

  const phone = "917231877273";   // your number

  const wish = secretWish || "Not written";
  const rating = secretRating || "Not given";
  const gift = selectedGift || "Surprise";

  const msg =
`🎁 Return Gift Received

Gift: ${gift}
Wish: ${wish}
Rating: ${rating}/5

— Someone special 💖`;

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

/**************** MOBILE TAP FIX ****************/
let lastTouch = 0;
document.addEventListener("touchend", function(e){
  const now = Date.now();
  if(now - lastTouch < 350) e.preventDefault();
  lastTouch = now;
});

/**************** MUSIC PLAYER CONTROLS ****************/
let currentSongIndex = 0;
const songNames = ["Song One","Song Two","Song Three"];
const songImages = ["assets/music1.jpg","assets/music2.jpg","assets/music3.jpg"];

const seekBar = document.getElementById("seekBar");
const playBtn = document.getElementById("playBtn");
const titleEl = document.getElementById("nowTitle");
const imgEl = document.getElementById("nowImg");

const oldPlaySong = playSong;
playSong = function(i){
  currentSongIndex = i;
  oldPlaySong(i);
  titleEl.textContent = songNames[i];
  imgEl.src = songImages[i];
  playBtn.textContent = "⏸";
};

function togglePlay(){
  if(player.paused){
    player.play();
    playBtn.textContent="⏸";
  }else{
    player.pause();
    playBtn.textContent="▶️";
  }
}

player.addEventListener("timeupdate",()=>{
  if(player.duration){
    seekBar.value = (player.currentTime/player.duration)*100;
  }
});
seekBar.addEventListener("input",()=>{
  if(player.duration){
    player.currentTime = (seekBar.value/100)*player.duration;
  }
});
/* ===== Typing Effect Engine ===== */
const typed = new Set();

function typeEffect(el){
  if(typed.has(el)) return;
  typed.add(el);

  const html = el.dataset.text;
  let i = 0;
  el.innerHTML = "";

  const interval = setInterval(()=>{
    el.innerHTML = html.slice(0,i+1);
    i++;
    if(i >= html.length) clearInterval(interval);
  }, 150);
}

/* Hook into page change */
const oldShowPage = showPage;
showPage = function(i){
  oldShowPage(i);
  document.querySelectorAll(".page.active .type-text").forEach(typeEffect);
};

/* ===== Blow to Blow Candles ===== */
let blowActive = false;
let audioContext, analyser, mic;

function startBlowDetection(){
  if(blowActive) return;
  blowActive = true;

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    mic = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    mic.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);
    let blowFrames = 0;

    function listen(){
      if(!blowActive) return;

      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for(let i = 0; i < data.length; i++){
        sum += Math.abs(data[i] - 128);
      }

      /* 🎯 Natural blow detection */
      if(sum > 700){
        blowFrames++;
        if(blowFrames > 10){   // ~0.2 seconds of real blowing
          blowActive = false;

          openWishCard(new Event("click"));
          return;
        }
      } else {
        blowFrames = 0; // reset if no continuous blow
      }

      requestAnimationFrame(listen);
    }

    listen();
  });
}

/* Activate when Cake Page opens */
const oldShowPage2 = showPage;

showPage = function(i){
  oldShowPage2(i);

  const hint = document.getElementById("blowHint");

  if(i === 4){   // Cake Page
    startBlowDetection();
    if(hint){
      hint.style.display = "block";
      hint.innerText = "💨 Blow on the candle";
    }
  } else {
    blowActive = false;
    if(hint) hint.style.display = "none";
  }
};
/* 🎵 Stop playlist when leaving music page */
let lastPage = 0;

const _finalShowPage = showPage;
showPage = function(i){
  // If leaving music page (3), stop playlist
  if(lastPage === 3 && i !== 3 && typeof player !== "undefined"){
    player.pause();
    player.currentTime = 0;
  }

  _finalShowPage(i);
  lastPage = i;
};





