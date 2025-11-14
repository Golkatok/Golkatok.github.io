// --- Основные переменные ---
const mainMenu = document.getElementById('main-menu');
const settingsMenu = document.getElementById('settings-menu');
const levelsMenu = document.getElementById('levels-menu');
const gameContainer = document.getElementById('game-container');
const pauseMenu = document.getElementById('pause-menu');
const cookieBanner = document.getElementById('cookie-banner');
const orientationWarning = document.getElementById('orientation-warning');
const levelsContainer = document.getElementById('levels-container');
const playBtn = document.getElementById('play-btn');
const levelsBtn = document.getElementById('levels-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsBack = document.getElementById('settings-back');
const levelsBack = document.getElementById('levels-back');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Настройки ---
let scale = 1;
let musicVolume = 0.5;
let sfxVolume = 0.5;
let vibration = true;
let currentLevel = 1;
let maxUnlockedLevel = parseInt(getCookie("maxLevel")) || 1;

// --- Проверка куки ---
if(!getCookie("acceptedCookies")) {
    cookieBanner.style.display = 'block';
}

document.getElementById('accept-cookies').addEventListener('click', () => {
    setCookie("acceptedCookies", "true", 365);
    cookieBanner.style.display = 'none';
});

// --- Меню ---
playBtn.addEventListener('click', () => startGame(maxUnlockedLevel));
levelsBtn.addEventListener('click', showLevelsMenu);
settingsBtn.addEventListener('click', showSettingsMenu);
settingsBack.addEventListener('click', () => {
    settingsMenu.style.display = 'none';
    mainMenu.style.display = 'block';
});
levelsBack.addEventListener('click', () => {
    levelsMenu.style.display = 'none';
    mainMenu.style.display = 'block';
});

// --- Уровни ---
function showLevelsMenu() {
    mainMenu.style.display = 'none';
    levelsMenu.style.display = 'block';
    levelsContainer.innerHTML = '';
    for(let i = 1; i <= 20; i++){
        const btn = document.createElement('button');
        btn.innerText = `Уровень ${i}`;
        btn.disabled = i > maxUnlockedLevel;
        btn.addEventListener('click', () => startGame(i));
        levelsContainer.appendChild(btn);
    }
}

// --- Настройки ---
document.getElementById('scale-slider').addEventListener('input', e => {
    scale = parseFloat(e.target.value);
    canvas.style.transform = `scale(${scale})`;
});
document.getElementById('music-slider').addEventListener('input', e => {
    musicVolume = parseFloat(e.target.value);
    if(gameMusic) gameMusic.volume = musicVolume;
});
document.getElementById('sfx-slider').addEventListener('input', e => {
    sfxVolume = parseFloat(e.target.value);
});
document.getElementById('vibration-checkbox').addEventListener('change', e => {
    vibration = e.target.checked;
});

// --- Игровой цикл ---
let gameRunning = false;
let player = {x:50, y:50, width:30, height:50, vx:0, vy:0, grounded:false};
let keys = {};
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- Управление ---
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// --- Mobile controls ---
document.getElementById('left-btn').addEventListener('touchstart', () => keys['ArrowLeft'] = true);
document.getElementById('left-btn').addEventListener('touchend', () => keys['ArrowLeft'] = false);
document.getElementById('right-btn').addEventListener('touchstart', () => keys['ArrowRight'] = true);
document.getElementById('right-btn').addEventListener('touchend', () => keys['ArrowRight'] = false);
document.getElementById('jump-btn').addEventListener('touchstart', () => keys[' '] = true);
document.getElementById('jump-btn').addEventListener('touchend', () => keys[' '] = false);

// --- Проверка ориентации ---
function checkOrientation() {
    if(window.innerHeight > window.innerWidth){
        orientationWarning.style.display = 'flex';
        gameContainer.style.display = 'none';
    } else {
        orientationWarning.style.display = 'none';
    }
}
window.addEventListener('resize', checkOrientation);
checkOrientation();

// --- Музыка ---
let gameMusic = new Audio('music/Music1 (prod. penguinmusic).mp3');
gameMusic.loop = true;
gameMusic.volume = musicVolume;

// --- Структура уровней ---
const levels = [];
for(let i=1;i<=20;i++){
    levels.push({
        platforms:[
            {x:0, y:canvas.height-50, width:canvas.width, height:50},
            {x:100*i, y:canvas.height-100-i*10, width:100, height:20}
        ],
        enemies:[
            {x:150*i, y:canvas.height-100-i*10-40, width:30, height:40, dir:1, range:100}
        ],
        bonuses:[
            {x:120*i, y:canvas.height-150-i*10, width:20, height:20, collected:false}
        ],
        door:{x:200*i, y:canvas.height-100-i*10-50, width:40, height:50}
    });
}

// --- Старт игры ---
function startGame(level) {
    mainMenu.style.display = 'none';
    levelsMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    gameRunning = true;
    currentLevel = level;
    gameMusic.play();
    player.x = 50; player.y = canvas.height-100;
    requestAnimationFrame(gameLoop);
}

// --- Игровой цикл ---
function gameLoop(){
    if(!gameRunning) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const lvl = levels[currentLevel-1];

    // --- Движение игрока ---
    if(keys['ArrowLeft'] || keys['a']) player.vx = -5;
    else if(keys['ArrowRight'] || keys['d']) player.vx = 5;
    else player.vx = 0;

    if((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.grounded){
        player.vy = -15;
        player.grounded = false;
        playSound('sounds/sound2.mp3');
    }

    player.vy += 0.8; // гравитация
    player.x += player.vx;
    player.y += player.vy;

    player.grounded = false;

    // --- Платформы ---
    lvl.platforms.forEach(p => {
        ctx.fillStyle = 'brown';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        // коллизия
        if(player.x < p.x+p.width && player.x+player.width > p.x && player.y+player.height > p.y && player.y+player.height < p.y+player.height+player.vy){
            player.y = p.y - player.height;
            player.vy = 0;
            player.grounded = true;
        }
    });

    // --- Враги ---
    lvl.enemies.forEach(e => {
        ctx.fillStyle = 'green';
        ctx.fillRect(e.x, e.y, e.width, e.height);
        e.x += e.dir*2;
        if(e.x > e.range + e.x || e.x < e.x - e.range) e.dir*=-1;
        // столкновение с игроком
        if(player.x < e.x+e.width && player.x+player.width > e.x && player.y < e.y+e.height && player.y+player.height > e.y){
            alert('Вы умерли!');
            gameRunning=false;
            gameContainer.style.display='none';
            mainMenu.style.display='block';
        }
    });

    // --- Бонусы ---
    lvl.bonuses.forEach(b => {
        if(!b.collected){
            ctx.fillStyle = 'yellow';
            ctx.fillRect(b.x, b.y, b.width, b.height);
            if(player.x < b.x+b.width && player.x+player.width > b.x && player.y < b.y+b.height && player.y+player.height > b.y){
                b.collected=true;
                playSound('sounds/sound3.mp3');
            }
        }
    });

    // --- Дверь ---
    const d = lvl.door;
    ctx.fillStyle='blue';
    ctx.fillRect(d.x,d.y,d.width,d.height);
    if(player.x < d.x+d.width && player.x+player.width > d.x && player.y < d.y+d.height && player.y+player.height > d.y){
        if(currentLevel<20){
            maxUnlockedLevel = Math.max(maxUnlockedLevel,currentLevel+1);
            setCookie('maxLevel', maxUnlockedLevel, 365);
            alert('Уровень пройден!');
            gameRunning=false;
            startGame(currentLevel+1);
        } else {
            alert('Вы прошли все уровни!');
            gameRunning=false;
            gameContainer.style.display='none';
            mainMenu.style.display='block';
        }
    }

    // --- Рисуем игрока ---
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(gameLoop);
}

// --- Вспомогательные функции ---
function playSound(src){
    let audio = new Audio(src);
    audio.volume = sfxVolume;
    audio.play();
}

function setCookie(name,value,days){
    let expires = "";
    if(days){
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        expires = "; expires="+ d.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name){
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++){
        let c = ca[i];
        while(c.charAt(0)==' ') c = c.substring(1,c.length);
        if(c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
        }
