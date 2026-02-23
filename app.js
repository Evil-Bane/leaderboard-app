/* ============================================
   ARENA SCORE v4 — Pro Abyss Logic & Animations
   Hero Scroll Assembly, Spotlight Hover, Magnetic 
   Buttons, and Player Analytics (SVG Charting)
   ============================================ */

(function () {
    'use strict';

    // Premium Color Palette mapping to CSS vars
    const COLORS = [
        '#f9d006', '#0070F3', '#50E3C2', '#7928CA', '#F5A623', '#FF0080',
        '#00E5FF', '#1DE9B6', '#76FF03', '#EEFF41', '#FF9E80', '#FF4081'
    ];

    const state = {
        players: [],
        round: 1,
        scoreIncrement: 1,
        colorIndex: 0,
        totalPoints: 0,
        peakScore: 0,
        totalChanges: 0,
        history: [], // { id: num, d: delta, s: newScore }
        timer: { seconds: 0, interval: null, running: false }
    };

    const DOM = {};

    function init() {
        cacheDom();
        bindEvents();
        setupTabs();
        setupMatchTimer();
        initProEffects();
        initScrollAssembly();
        updateUI(); // Fixed typo causing ReferenceError
    }

    function cacheDom() {
        DOM.input = document.getElementById('player-name-input');
        DOM.addBtn = document.getElementById('add-player-btn');
        DOM.list = document.getElementById('player-list');
        DOM.emptyState = document.getElementById('empty-state');

        DOM.roundNum = document.getElementById('round-number');
        DOM.nextRoundBtn = document.getElementById('next-round-btn');
        DOM.resetBtn = document.getElementById('reset-btn');

        DOM.statTotal = document.getElementById('stat-total');
        DOM.statPeak = document.getElementById('stat-highest');
        DOM.statAvg = document.getElementById('stat-avg');
        DOM.statStreaks = document.getElementById('stat-streaks');

        DOM.distSection = document.getElementById('score-distribution-section');
        DOM.distChart = document.getElementById('distribution-chart');

        DOM.historyTimeline = document.getElementById('history-timeline');
        DOM.historyEmpty = document.getElementById('history-empty');
        DOM.timerDisplay = document.getElementById('match-timer');

        // Modal DOM
        DOM.modal = document.getElementById('analytics-modal');
        DOM.closeModal = document.getElementById('close-modal-btn');
    }

    // ============================================
    // GSAP SCROLL ASSEMBLY (PRO FEATURE)
    // ============================================
    function initScrollAssembly() {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Parallax Fade
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '#hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 150, opacity: 0, scale: 0.95
        });

        // When scrolling past the Hero, the dashboard pieces assemble
        const items = gsap.utils.toArray('.assemble-item');

        items.forEach((item, i) => {
            gsap.fromTo(item,
                { y: 100, autoAlpha: 0, rotationX: 10 },
                {
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 95%', // Trigger slightly earlier for speed
                        toggleActions: 'play none none none'
                    },
                    y: 0, autoAlpha: 1, rotationX: 0,
                    duration: 0.8,
                    delay: i * 0.05,
                    ease: 'power3.out'
                }
            );
        });

        // CTA Button scrolls down to start
        document.getElementById('start-match-btn').addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
            setTimeout(() => {
                if (DOM.input) DOM.input.focus({ preventScroll: true });
            }, 600);
        });
    }

    // ============================================
    // PRO HOVER EFFECTS (MAGNETIC & SPOTLIGHT)
    // ============================================
    function initProEffects() {
        // Magnetic Buttons
        const magnets = document.querySelectorAll('.magnetic-btn');
        magnets.forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const h = rect.width / 2;
                const v = rect.height / 2;
                const x = e.clientX - rect.left - h;
                const y = e.clientY - rect.top - v;
                // Pull the button towards mouse slightly
                gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
            });
        });
    }

    // Attaches spotlight and 3D tilt tracking to individual cards
    function attachCardEffects(card) {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Spotlight variables for CSS radial gradient
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // 3D Tilt
            const rx = ((y / rect.height) - 0.5) * -8;
            const ry = ((x / rect.width) - 0.5) * 8;
            gsap.to(card, { rotationX: rx, rotationY: ry, duration: 0.3, transformPerspective: 1000, ease: 'power2.out' });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        });
    }

    // ============================================
    // MATCH TIMER
    // ============================================
    function setupMatchTimer() {
        if (state.timer.running) return;
        state.timer.running = true;
        state.timer.interval = setInterval(() => {
            state.timer.seconds++;
            const h = Math.floor(state.timer.seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((state.timer.seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (state.timer.seconds % 60).toString().padStart(2, '0');
            DOM.timerDisplay.textContent = `${h}:${m}:${s}`;
        }, 1000);
    }

    function resetTimer() {
        state.timer.seconds = 0;
        DOM.timerDisplay.textContent = "00:00:00";
        gsap.from(DOM.timerDisplay, { scale: 1.3, duration: 0.5 });
    }

    // ============================================
    // TAB NAVIGATION
    // ============================================
    function setupTabs() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const targetId = 'tab-' + tab.dataset.tab;
                document.getElementById(targetId).classList.add('active');
                setTimeout(() => ScrollTrigger.refresh(), 100);
            });
        });
    }

    // ============================================
    // PLAYER MANAGEMENT
    // ============================================
    function getNextColor() { return COLORS[state.colorIndex++ % COLORS.length]; }

    function addPlayer(name) {
        name = name.trim();
        if (!name) return;

        const player = {
            id: Date.now(),
            name: name,
            score: 0,
            color: getNextColor(),
            consecutivePositive: 0,
            totalPos: 0, // For win rate
            totalActions: 0 // For win rate
        };

        state.players.push(player);
        const card = createPlayerCard(player, state.players.length);
        DOM.list.appendChild(card);

        attachCardEffects(card);

        // Record initial history state 0
        state.history.push({ id: player.id, d: 0, s: 0, time: Date.now(), name: player.name, color: player.color, r: state.round });

        gsap.from(card, {
            y: 40, opacity: 0, scale: 0.9,
            duration: 0.6,
            ease: 'back.out(1.5)',
            onComplete: () => {
                sortPlayers();
                ScrollTrigger.refresh();
            }
        });

        DOM.input.value = '';
        updateUI();
        fireConfetti(player.color);
    }

    function removePlayer(id) {
        const card = document.querySelector(`.player-card[data-id="${id}"]`);
        if (!card) return;

        gsap.to(card, {
            x: -150, opacity: 0, height: 0, padding: 0, margin: 0,
            duration: 0.4, ease: 'power3.inOut',
            onComplete: () => {
                card.remove();
                state.players = state.players.filter(p => p.id !== id);
                sortPlayers();
                updateUI();
                ScrollTrigger.refresh();
            }
        });
    }

    function changeScore(id, isPositive) {
        const player = state.players.find(p => p.id === id);
        if (!player) return;

        const delta = isPositive ? state.scoreIncrement : -state.scoreIncrement;
        const oldScore = player.score;
        player.score += delta;
        player.totalActions++;

        if (isPositive) {
            player.consecutivePositive++;
            player.totalPos++;
        } else {
            player.consecutivePositive = 0;
        }

        state.totalPoints += delta;
        state.totalChanges++;
        state.peakScore = Math.max(state.peakScore, player.score);

        const h = { id: player.id, name: player.name, color: player.color, d: delta, s: player.score, r: state.round, time: Date.now() };
        state.history.unshift(h);
        if (state.history.length > 100) state.history.pop();

        addHistoryTimelineUI(h);
        animateScoreChange(id, oldScore, player.score, isPositive, player.consecutivePositive);
    }

    // ============================================
    // UI UPDATES & ANIMATIONS
    // ============================================
    function createPlayerCard(player, rank) {
        const card = document.createElement('div');
        card.className = 'player-card assemble-item';
        card.dataset.id = player.id;

        card.innerHTML = `
            <div class="pc-rank">#${rank}</div>
            <div class="pc-info">
                <span class="pc-name" style="color: ${player.color}">${escapeHtml(player.name)}</span>
                <div class="streak-indicator">🔥 STREAK</div>
            </div>
            <div class="pc-score-wrapper">
                <span class="pc-score">${player.score}</span>
            </div>
            <div class="pc-actions">
                <button class="score-btn minus" data-id="${player.id}">−</button>
                <button class="score-btn plus" data-id="${player.id}">+</button>
            </div>
            <button class="remove-player-btn" data-id="${player.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;
        return card;
    }

    function animateScoreChange(id, oldS, newS, isPositive, streak) {
        const card = document.querySelector(`.player-card[data-id="${id}"]`);
        if (!card) return;

        const scoreEl = card.querySelector('.pc-score');
        const streakEl = card.querySelector('.streak-indicator');

        // Counter Animation
        const obj = { v: oldS };
        anime({
            targets: obj,
            v: newS, round: 1, duration: 400,
            easing: 'easeOutExpo',
            update: () => { scoreEl.textContent = obj.v; }
        });

        // Spring scale effect
        gsap.fromTo(card,
            { scale: isPositive ? 1.03 : 0.97 },
            { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }
        );

        // Flash Color
        const flashColor = isPositive ? 'var(--accent-green)' : 'var(--accent-red)';
        gsap.to(scoreEl, {
            color: flashColor, textShadow: `0 0 15px ${flashColor}`,
            duration: 0.2, yoyo: true, repeat: 1,
            onComplete: () => gsap.set(scoreEl, { clearProps: "all" })
        });

        // Streak Visibility
        if (streak >= 3) {
            streakEl.classList.add('active');
            gsap.from(streakEl, { scale: 0, rotation: -10, duration: 0.4, ease: 'back.out' });
        } else {
            streakEl.classList.remove('active');
        }

        sortPlayers();
        updateUI();
    }

    function sortPlayers() {
        if (state.players.length === 0) return;

        const cards = Array.from(DOM.list.querySelectorAll('.player-card'));
        const fs = Flip.getState(cards);

        state.players.sort((a, b) => b.score - a.score);

        state.players.forEach((p, idx) => {
            const card = document.querySelector(`.player-card[data-id="${p.id}"]`);
            if (card) {
                DOM.list.appendChild(card);
                card.querySelector('.pc-rank').textContent = `#${idx + 1}`;
                if (idx === 0 && state.players.length > 1 && p.score > state.players[1].score) {
                    card.classList.add('is-leader');
                } else {
                    card.classList.remove('is-leader');
                }
            }
        });

        Flip.from(fs, {
            duration: 0.5, ease: 'power2.inOut', stagger: 0.05,
            onComplete: () => {
                ScrollTrigger.refresh();
                document.querySelectorAll('.streak-indicator.active').forEach(el => el.style.opacity = '1');
            }
        });
    }

    function updateUI() {
        DOM.emptyState.classList.toggle('hidden', state.players.length > 0);

        // Stats
        const top = state.players.length ? Math.max(...state.players.map(p => p.score)) : 0;
        const tot = state.players.reduce((a, b) => a + b.score, 0);
        const avg = state.players.length ? Math.round(tot / state.players.length) : 0;
        const streaks = state.players.filter(p => p.consecutivePositive >= 3).length;

        animStat(DOM.statTotal, tot);
        animStat(DOM.statPeak, Math.max(state.peakScore, top));
        animStat(DOM.statAvg, avg);
        animStat(DOM.statStreaks, streaks);

        updateDistributionChart();
    }

    function animStat(el, val) {
        if (!el) return;
        const cur = parseInt(el.textContent) || 0;
        if (cur === val) return;
        const o = { v: cur };
        anime({ targets: o, v: val, round: 1, duration: 500, easing: 'easeOutCirc', update: () => el.textContent = o.v });
    }

    // ============================================
    // DISTRIBUTION CHART
    // ============================================
    function updateDistributionChart() {
        if (state.players.length === 0) {
            DOM.distSection.classList.add('hidden');
            return;
        }
        DOM.distSection.classList.remove('hidden');
        DOM.distChart.innerHTML = '';

        const sorted = [...state.players].sort((a, b) => b.score - a.score);
        const maxS = Math.max(...sorted.map(p => Math.abs(p.score)), 1);

        sorted.forEach(p => {
            const pct = Math.max(5, (Math.abs(p.score) / maxS) * 100);
            const row = document.createElement('div');
            row.className = 'dist-row';
            row.innerHTML = `
                <span class="dist-name" style="color:${p.color}">${escapeHtml(p.name)}</span>
                <div class="dist-bar-wrapper">
                    <div class="dist-bar" style="width:${pct}%;--bg-color:${p.color}"></div>
                </div>
                <span class="dist-value">${p.score}</span>
            `;
            DOM.distChart.appendChild(row);
        });
    }

    // ============================================
    // PLAYER ANALYTICS MODAL (PRO FEATURE)
    // ============================================
    function openAnalyticsModal(id) {
        const player = state.players.find(p => p.id === id);
        if (!player) return;

        // Populate basic data
        document.getElementById('modal-avatar').style.setProperty('--player-color', player.color);
        document.getElementById('modal-player-name').textContent = player.name;
        document.getElementById('modal-player-name').style.color = player.color;
        document.getElementById('modal-score').textContent = player.score;

        // Find Rank and Peak
        const sorted = [...state.players].sort((a, b) => b.score - a.score);
        const rank = sorted.findIndex(p => p.id === id) + 1;
        document.getElementById('modal-player-rank').textContent = `Rank #${rank}`;

        // Get Player History points for graph & peak
        const playerHistory = state.history.filter(h => h.id === id).reverse();
        // Since history is prepended on action, we filter out initial 0 point, but we need it for origin.
        // Actually, ascending sequential timeline of scores.
        const scoreTimeline = playerHistory.map(h => h.s);

        const peak = scoreTimeline.length ? Math.max(...scoreTimeline) : 0;
        document.getElementById('modal-peak').textContent = peak;

        // Calculate Win Rate (Positive actions / Total actions)
        let winRate = 0;
        if (player.totalActions > 0) {
            winRate = Math.round((player.totalPos / player.totalActions) * 100);
        }
        document.getElementById('modal-winrate-text').textContent = `${winRate}%`;

        // Animate circular progress
        const circFill = document.getElementById('modal-winrate-fill');
        circFill.style.stroke = player.color;
        requestAnimationFrame(() => {
            circFill.style.strokeDasharray = `${winRate}, 100`;
        });

        // Draw SVG Chart
        drawModalChart(scoreTimeline, player.color);

        // Show Modal
        DOM.modal.classList.add('active');
        gsap.fromTo('.modal-container',
            { y: 30, scale: 0.95 },
            { y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }
        );
    }
    // Event listeners are bound in bindEvents()

    function drawModalChart(dataPoints, hexColor) {
        const container = document.getElementById('modal-line-chart');
        container.innerHTML = '';
        if (dataPoints.length < 2) {
            container.innerHTML = '<div style="color:#888; text-align:center; padding-top:40px;">Not enough telemetry data.</div>';
            return;
        }

        const W = container.clientWidth;
        const H = container.clientHeight;
        const pad = 10;

        const minVal = Math.min(...dataPoints) < 0 ? Math.min(...dataPoints) : 0;
        const maxVal = Math.max(...dataPoints, 10); // Ensure some scale
        const range = maxVal - minVal;

        const pts = dataPoints.map((val, idx) => {
            const x = pad + (idx / (dataPoints.length - 1)) * (W - pad * 2);
            // normalized Y (invert since SVG Y goes down)
            const y = H - pad - ((val - minVal) / range) * (H - pad * 2);
            return `${x},${y}`;
        }).join(' ');

        // Draw SVG Polyline
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.overflow = 'visible';

        // Draw a baseline for zero if min is negative
        if (minVal < 0) {
            const zeroY = H - pad - ((0 - minVal) / range) * (H - pad * 2);
            const baseline = document.createElementNS("http://www.w3.org/2000/svg", "line");
            baseline.setAttribute('x1', 0); baseline.setAttribute('y1', zeroY);
            baseline.setAttribute('x2', W); baseline.setAttribute('y2', zeroY);
            baseline.setAttribute('stroke', 'rgba(255,255,255,0.1)');
            baseline.setAttribute('stroke-dasharray', '4');
            svg.appendChild(baseline);
        }

        const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttribute('points', pts);
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', hexColor);
        polyline.setAttribute('stroke-width', '3');
        polyline.setAttribute('stroke-linecap', 'round');
        polyline.setAttribute('stroke-linejoin', 'round');

        // Add glow filter
        polyline.style.filter = `drop-shadow(0 0 8px ${hexColor})`;

        svg.appendChild(polyline);
        container.appendChild(svg);

        // Animate path drawing
        const pathLength = polyline.getTotalLength ? polyline.getTotalLength() : 1000;
        gsap.fromTo(polyline,
            { strokeDasharray: pathLength, strokeDashoffset: pathLength },
            { strokeDashoffset: 0, duration: 1.5, ease: 'power3.out' }
        );
    }

    // ============================================
    // HISTORY TIMELINE LOGIC
    // ============================================
    function addHistoryTimelineUI(h) {
        if (DOM.historyEmpty) DOM.historyEmpty.style.display = 'none';

        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
            <span class="hi-round">R${h.r}</span>
            <span class="hi-name" style="--item-color:${h.color}">${escapeHtml(h.name)}</span>
            <span class="hi-delta ${h.d > 0 ? 'positive' : 'negative'}">${h.d > 0 ? '+' + h.d : h.d}</span>
            <span class="hi-score">${h.s} pts</span>
        `;
        DOM.historyTimeline.prepend(el);
        gsap.from(el, { x: -30, opacity: 0, duration: 0.4 });
    }

    // ============================================
    // GLOBAL EVENTS
    // ============================================
    function bindEvents() {
        DOM.addBtn.addEventListener('click', () => addPlayer(DOM.input.value));
        DOM.input.addEventListener('keypress', e => { if (e.key === 'Enter') addPlayer(DOM.input.value); });

        document.addEventListener('click', e => {
            // Check Player Card interaction
            const card = e.target.closest('.player-card');
            if (card) {
                // If they clicked a button inside, handle that, otherwise open Analytics
                const btn = e.target.closest('button');
                if (btn) {
                    const id = parseInt(btn.dataset.id);
                    if (btn.classList.contains('plus')) changeScore(id, true);
                    else if (btn.classList.contains('minus')) changeScore(id, false);
                    else if (btn.classList.contains('remove-player-btn')) removePlayer(id);
                } else {
                    // Clicked the card body -> Open Analytics Modal
                    openAnalyticsModal(parseInt(card.dataset.id));
                }
                return;
            }

            // Step Selector
            const seg = e.target.closest('.segment');
            if (seg && seg.parentElement.id === 'increment-selector') {
                document.querySelectorAll('.segment').forEach(s => s.classList.remove('active'));
                seg.classList.add('active');
                state.scoreIncrement = parseInt(seg.dataset.value);
            }
        });

        DOM.nextRoundBtn.addEventListener('click', () => {
            state.round++;
            gsap.fromTo(DOM.roundNum, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out' });
            DOM.roundNum.textContent = state.round;
        });

        DOM.resetBtn.addEventListener('click', () => {
            state.players.forEach(p => {
                p.score = 0; p.consecutivePositive = 0; p.totalPos = 0; p.totalActions = 0;
            });
            state.round = 1;
            state.history = [];
            state.peakScore = 0;
            DOM.historyTimeline.innerHTML = '';
            DOM.historyEmpty.style.display = 'block';
            DOM.roundNum.textContent = '1';
            resetTimer();
            sortPlayers();
            updateUI();

            document.querySelectorAll('.pc-score').forEach(el => el.textContent = '0');
            document.querySelectorAll('.streak-indicator').forEach(el => el.classList.remove('active'));
        });

        DOM.closeModal.addEventListener('click', () => {
            DOM.modal.classList.remove('active');
            document.getElementById('modal-winrate-fill').style.strokeDasharray = '0, 100'; // reset ring
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function fireConfetti(color) {
        if (typeof confetti !== 'function') return;
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: [color, '#ffffff']
        });
    }

    // Modal close on clicking overlay background
    document.addEventListener('click', e => {
        if (e.target === DOM.modal) DOM.closeModal.click();
    });
    // Modal close on Esc
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && DOM.modal.classList.contains('active')) {
            DOM.closeModal.click();
        }
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
