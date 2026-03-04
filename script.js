document.addEventListener('DOMContentLoaded', () => {
    // === GLOBAL: Year & Loader ===
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const loader = document.querySelector('.loader-overlay');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }, 800);
    }

    const storyCards = document.querySelectorAll('.story-card');
    if (storyCards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    const video = entry.target.querySelector('video');
                    if (video) video.play().catch(e => console.log("Auto-play blocked", e));
                } else {
                    const video = entry.target.querySelector('video');
                    if (video) video.pause();
                }
            });
        }, { threshold: 0.2 });
        storyCards.forEach(card => observer.observe(card));
    }

    // === PAGE ROUTING ===
    if (document.getElementById('dictionary')) initDictionary();
    if (document.getElementById('personality-quiz')) initPersonalityQuiz();
    if (document.getElementById('vatra')) initVatra();
    if (document.getElementById('game-menu')) {
        updateHighscoreDisplay();
    }
    
    // Game Navigation
    window.showGame = (gameId) => {
        document.getElementById('game-menu').style.display = 'none';
        if (gameId === 'flock') {
            document.getElementById('game-flock').style.display = 'block';
            initFlockGame();
        }
        if (gameId === 'jumper') {
            document.getElementById('game-jumper').style.display = 'block';
            updateHighscoreDisplay();
        }
    };

    window.showMenu = () => {
        document.getElementById('game-flock').style.display = 'none';
        document.getElementById('game-jumper').style.display = 'none';
        document.getElementById('game-menu').style.display = 'grid';
        if (typeof flockAnimId !== 'undefined') cancelAnimationFrame(flockAnimId);
        if (typeof jumperAnimId !== 'undefined') cancelAnimationFrame(jumperAnimId);
    };
});

/* =========================================
   DICTIONARY LOGIC
   ========================================= */
function initDictionary() {
    const dictionaryData = [
        { word: "Кошара", question: "Як називається спеціальна дерев'яна загорожа для овець?", options: ["Колиба", "Кошара", "Струнка", "Путера"], correct: 1, definition: "Дерев'яна загорожа для овець на полонині.", image: "🐑" },
        { word: "Струнка", question: "Де вівчарі доять овець під час дощу?", options: ["У колибі", "Під деревом", "У струнці", "На галявині"], correct: 2, definition: "Дерев'яне накриття для доїння овець.", image: "🌧️" },
        { word: "Путера", question: "У що вівчарі зливають молоко після доїння?", options: ["У відра", "У путери", "У бідони", "У каструлі"], correct: 1, definition: "Велика дерев'яна діжка для молока.", image: "🥛" },
        { word: "Жентиця", question: "Як називається сироватка, що залишається після варіння сиру?", options: ["Жентиця", "Юшка", "Вурда", "Будз"], correct: 0, definition: "Корисна сироватка з овечого молока.", image: "🍶" },
        { word: "Боталей", question: "Що таке 'Боталей'?", options: ["Шапка", "Палиця", "Дзвіночок", "Пояс"], correct: 2, definition: "Металевий дзвіночок на шиї у вівці.", image: "🔔" }
    ];

    let currentQuestionIndex = 0;
    const questionText = document.getElementById('question-text');
    const questionNumber = document.getElementById('question-number');
    const optionsContainer = document.getElementById('options');
    const flashcardsGrid = document.getElementById('flashcards-display');
    const quizCard = document.getElementById('question-card');

    function loadQuestion() {
        if (!questionText) return;
        const current = dictionaryData[currentQuestionIndex];
        questionText.textContent = current.question;
        questionNumber.textContent = `Питання ${currentQuestionIndex + 1}/${dictionaryData.length}`;
        optionsContainer.innerHTML = '';
        current.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(index, btn);
            optionsContainer.appendChild(btn);
        });
    }

    function checkAnswer(selectedIndex, btn) {
        const current = dictionaryData[currentQuestionIndex];
        if (selectedIndex === current.correct) {
            btn.classList.add('correct');
            addFlashcard(current);
            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < dictionaryData.length) {
                    loadQuestion();
                } else {
                    quizCard.innerHTML = "<h3>Вітаємо! Ви вивчили терміни полонини.</h3><p>Усі картки додано нижче.</p>";
                }
            }, 800);
        } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 500);
        }
    }

    function addFlashcard(data) {
        if (flashcardsGrid.style.display === 'none') flashcardsGrid.style.display = 'grid';
        const card = document.createElement('div');
        card.className = 'flashcard';
        card.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <span style="font-size: 3rem">${data.image}</span>
                    <h3>${data.word}</h3>
                    <small>Натисніть</small>
                </div>
                <div class="flashcard-back">
                    <h3>${data.word}</h3>
                    <p>${data.definition}</p>
                </div>
            </div>`;
        card.onclick = () => card.classList.toggle('flipped');
        flashcardsGrid.appendChild(card);
    }
    loadQuestion();
}

/* =========================================
   PERSONALITY QUIZ
   ========================================= */
function initPersonalityQuiz() {
    window.startPersonalityQuiz = () => {
        const quizBox = document.getElementById('p-quiz-box');
        const questions = ["Ви більше любите:", "Ваша суперсила:", "Де ви почуваєтесь найкраще:"];
        const answers = [
            ["Керувати процесом", "Допомагати іншим", "Охороняти спокій"],
            ["Мудрість", "Спритність", "Відданість"],
            ["Біля вогню", "На полонині", "В лісі"]
        ];
        let pStep = 0;
        let pScore = { vatag: 0, vivchar: 0, pes: 0 };

        function renderPQuestion() {
            if (pStep >= questions.length) {
                const max = Object.keys(pScore).reduce((a, b) => pScore[a] > pScore[b] ? a : b);
                let result = (max === 'vatag') ? "Ви — Мудрий Ватаг!" : (max === 'vivchar' ? "Ви — Спритний Вівчар!" : "Ви — Вірний Пес-охоронець!");
                quizBox.innerHTML = `<h3>Ваш результат:</h3><p style="font-size: 1.5rem; color: var(--accent-color); margin: 20px 0;">${result}</p><button class="btn" onclick="location.reload()">Пройти ще раз</button>`;
                return;
            }
            quizBox.innerHTML = `<h3>${questions[pStep]}</h3><div class="options-grid"></div>`;
            const container = quizBox.querySelector('.options-grid');
            answers[pStep].forEach((ans, i) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = ans;
                btn.onclick = () => {
                    if (i === 0) pScore.vatag++;
                    if (i === 1) pScore.vivchar++;
                    if (i === 2) pScore.pes++;
                    pStep++;
                    renderPQuestion();
                };
                container.appendChild(btn);
            });
        }
        renderPQuestion();
    };
}

/* =========================================
   VATRA LOGIC
   ========================================= */
function initVatra() {
    const canvas = document.getElementById('fireCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let intensity = 1;

    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 250;

    class Particle {
        constructor() {
            this.x = canvas.width / 2 + (Math.random() - 0.5) * 60;
            this.y = canvas.height - 20;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = Math.random() * -3 - 1;
            this.life = 100;
            this.size = Math.random() * 20 + 10;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            this.life -= 1.5; this.size *= 0.96;
            return this.life > 0 && this.size > 1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${Math.floor(this.life * 1.5)}, 0, ${this.life/100})`;
            ctx.fill();
        }
    }

    function loop() {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for(let i=0; i<intensity*3; i++) particles.push(new Particle());
        particles = particles.filter(p => p.update());
        particles.forEach(p => p.draw());
        requestAnimationFrame(loop);
    }
    loop();

    window.submitFeedback = () => {
        const text = document.getElementById('feedback-text').value;
        if (!text) return alert("Напишіть відгук!");
        intensity = 6;
        setTimeout(() => intensity = 1, 2500);
        document.getElementById('feedback-ui').style.display = 'none';
        document.getElementById('donation-links').style.display = 'block';
    };

    window.resetVatra = () => {
        document.getElementById('feedback-text').value = '';
        document.getElementById('feedback-ui').style.display = 'block';
        document.getElementById('donation-links').style.display = 'none';
    };
}

/* =========================================
   GAME 1: GUARDIAN OF THE FLOCK
   ========================================= */
let flockAnimId;
function initFlockGame() {
    document.getElementById('flock-overlay').style.display = 'none';
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 500;

    let sheep = [], dog = { x: 0, y: 0 }, gate = { x: canvas.width/2 - 50, y: 0, w: 100, h: 50 };
    let sheepInPen = 0;

    canvas.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        dog.x = e.clientX - r.left; dog.y = e.clientY - r.top;
    });

    class Sheep {
        constructor() { this.x = Math.random()*canvas.width; this.y = canvas.height-50-Math.random()*100; this.vx = 0; this.vy = 0; this.inPen = false; }
        update() {
            if (this.inPen) return;
            const dx = this.x - dog.x, dy = this.y - dog.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 100) { this.vx += dx/dist * 0.8; this.vy += dy/dist * 0.8; }
            
            // Random continuous movement
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;

            this.vx *= 0.98; this.vy *= 0.98;
            this.x += this.vx; this.y += this.vy;
            if (this.x < 10) this.x = 10; if (this.x > canvas.width-10) this.x = canvas.width-10;
            if (this.y > canvas.height-10) this.y = canvas.height-10;
            if (this.y < 50 && this.x > gate.x && this.x < gate.x + gate.w) {
                this.inPen = true; sheepInPen++;
                document.getElementById('score').innerText = sheepInPen;
            } else if (this.y < 10) this.y = 10;
        }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, 6, 0, Math.PI*2);
            ctx.fillStyle = this.inPen ? '#555' : '#fff'; ctx.fill();
        }
    }

    for(let i=0; i<20; i++) sheep.push(new Sheep());

    function loop() {
        ctx.fillStyle = '#2d5a27'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = 'rgba(0,255,0,0.3)'; ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
        sheep.forEach(s => { s.update(); s.draw(); });
        ctx.beginPath(); ctx.arc(dog.x, dog.y, 12, 0, Math.PI*2); ctx.fillStyle = '#fc0'; ctx.fill();
        if (sheepInPen < 20) flockAnimId = requestAnimationFrame(loop);
        else { alert("Вівці в кошарі!"); showMenu(); }
    }
    loop();
}

/* =========================================
   GAME 2: SHEEP JUMPER
   ========================================= */
let jumperAnimId;
let jumperScore = 0;
window.startJumperGame = () => {
    document.getElementById('jumper-overlay').style.display = 'none';
    const canvas = document.getElementById('jumperCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = 500;

    let player = { x: canvas.width/2, y: canvas.height-100, vx: 0, vy: 0, w: 30, h: 30 };
    let platforms = [];
    jumperScore = 0;

    for(let i=0; i<7; i++) platforms.push({ x: Math.random()*(canvas.width-60), y: canvas.height - i*80 - 40, w: 60, h: 10 });
    platforms.push({ x: 0, y: canvas.height-20, w: canvas.width, h: 20 }); // Base

    canvas.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        player.x = (e.clientX - r.left) - player.w/2;
    });

    function loop() {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,canvas.width,canvas.height);
        player.vy += 0.3; player.y += player.vy;
        
        if (player.y < canvas.height/2) {
            let diff = canvas.height/2 - player.y; player.y = canvas.height/2;
            jumperScore += Math.floor(diff/10);
            document.getElementById('jump-score').innerText = jumperScore;
            platforms.forEach(p => {
                p.y += diff;
                if (p.y > canvas.height) {
                    p.y = 0; p.x = Math.random()*(canvas.width-60);
                }
            });
        }

        if (player.vy > 0) {
            platforms.forEach(p => {
                if (player.x < p.x+p.w && player.x+player.w > p.x && player.y+player.h > p.y && player.y+player.h < p.y+p.h+10) {
                    player.vy = -10;
                }
            });
        }

        platforms.forEach(p => { ctx.fillStyle = '#8b4513'; ctx.fillRect(p.x, p.y, p.w, p.h); });
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(player.x+15, player.y+15, 15, 0, Math.PI*2); ctx.fill();

        if (player.y > canvas.height) {
            saveHighscore(jumperScore);
            document.getElementById('jumper-overlay').style.display = 'flex';
            document.getElementById('jumper-overlay').innerHTML = `<h3>Ви впали!</h3><p>Рахунок: ${jumperScore}</p><button class="btn" onclick="startJumperGame()">Ще раз</button>`;
        } else {
            jumperAnimId = requestAnimationFrame(loop);
        }
    }
    loop();
};

function saveHighscore(score) {
    let s = JSON.parse(localStorage.getItem('h_scores') || '[]');
    s.push({ s: score, d: new Date().toLocaleDateString() });
    s.sort((a,b) => b.s - a.s);
    localStorage.setItem('h_scores', JSON.stringify(s.slice(0,10)));
}

function updateHighscoreDisplay() {
    const list = document.getElementById('highscores-list');
    const s = JSON.parse(localStorage.getItem('h_scores') || '[]');
    if (list) list.innerHTML = s.map((x,i) => `<li>${i+1}. ${x.s}м <small>(${x.d})</small></li>`).join('');
}
