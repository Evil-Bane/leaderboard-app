/* ============================================
   FRAMES.JS — Initialization & Cinematic Sequence
   No scroll locks. Pure timeline-based playback.
   ============================================ */

(function () {
    'use strict';

    const FRAME_COUNT = 120;
    const canvas = document.getElementById('frame-canvas');
    const ctx = canvas.getContext('2d');
    const images = [];
    const frameState = { currentIndex: 0 };
    let loadedCount = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderFrame(frameState.currentIndex);
    }

    function renderFrame(index) {
        const img = images[index];
        if (!img || !img.complete) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const imgR = img.width / img.height;
        const canR = canvas.width / canvas.height;
        let dw, dh, dx, dy;
        if (canR > imgR) { dw = canvas.width; dh = dw / imgR; dx = 0; dy = (canvas.height - dh) / 2; }
        else { dh = canvas.height; dw = dh * imgR; dx = (canvas.width - dw) / 2; dy = 0; }
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    function getFramePath(i) {
        return `frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;
    }

    function preloadFrames() {
        return new Promise(resolve => {
            const percentEl = document.getElementById('loading-percentage');
            const barFill = document.getElementById('loading-bar-fill');
            for (let i = 0; i < FRAME_COUNT; i++) {
                const img = new Image();
                img.src = getFramePath(i);
                img.onload = img.onerror = () => {
                    loadedCount++;
                    const pct = Math.floor((loadedCount / FRAME_COUNT) * 100);
                    if (percentEl) percentEl.textContent = pct + '%';
                    if (barFill) barFill.style.width = pct + '%';
                    if (loadedCount === FRAME_COUNT) resolve();
                };
                images[i] = img;
            }
        });
    }

    // ---- Init Screen Animation ----
    function animateInitScreen() {
        const tl = gsap.timeline();

        // Crown entrance
        tl.to('#init-crown', {
            opacity: 1, scale: 1, duration: 0.8,
            ease: 'elastic.out(1, 0.6)'
        }, 0.3);

        // Title
        tl.to('#init-title', {
            opacity: 1, duration: 0.6,
            ease: 'power2.out'
        }, 0.6);

        // Tagline
        tl.to('#init-tagline', {
            opacity: 1, duration: 0.5,
            ease: 'power2.out'
        }, 1.0);

        // Crown float
        tl.to('#init-crown', {
            y: -8, duration: 2.2,
            repeat: -1, yoyo: true,
            ease: 'sine.inOut'
        }, 1.2);
    }

    // ---- Create Init Particles ----
    function createInitParticles() {
        const container = document.getElementById('init-particles');
        if (!container) return;
        for (let i = 0; i < 60; i++) {
            const el = document.createElement('div');
            el.className = 'particle';
            const s = Math.random() * 2.5 + 0.5;
            el.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;opacity:${Math.random() * 0.3 + 0.1}`;
            container.appendChild(el);
            anime({
                targets: el,
                translateX: () => anime.random(-50, 50),
                translateY: () => anime.random(-70, 70),
                opacity: () => Math.random() * 0.2 + 0.05,
                duration: () => anime.random(4000, 7000),
                delay: () => anime.random(0, 2000),
                direction: 'alternate', loop: true, easing: 'easeInOutSine'
            });
        }
    }

    // ---- Cinematic Section: play frames as video ----
    function playCinematicSequence() {
        const duration = FRAME_COUNT / 30; // ~4 seconds at 30fps

        gsap.to(frameState, {
            currentIndex: FRAME_COUNT - 1,
            duration: duration,
            ease: 'power1.inOut',
            onUpdate: () => renderFrame(Math.round(frameState.currentIndex)),
            onComplete: () => transitionToApp()
        });
    }

    // ---- Transition from Init to App ----
    function transitionToApp() {
        const initScreen = document.getElementById('init-screen');
        const tl = gsap.timeline({
            onComplete: () => {
                initScreen.style.display = 'none';
                revealApp();
            }
        });

        tl.to('#init-content', {
            scale: 0.9, opacity: 0, duration: 0.5, ease: 'power2.in'
        }, 0);

        tl.to('#init-glow', { opacity: 0, duration: 0.4 }, 0.1);

        tl.to(initScreen, {
            opacity: 0, duration: 0.6, ease: 'power2.inOut'
        }, 0.3);
    }

    // ---- Reveal Scoreboard App ----
    function revealApp() {
        const tl = gsap.timeline();

        tl.to('#app', { opacity: 1, duration: 0.3 });

        // Header slides in
        tl.from('#app-header', {
            y: -60, opacity: 0, duration: 0.6, ease: 'power3.out'
        }, '-=0.1');

        // Split text heading
        tl.from('#section-heading .char', {
            opacity: 0, y: 40, rotateX: -90,
            stagger: 0.04, duration: 0.6, ease: 'back.out(1.7)'
        }, '-=0.3');

        tl.from('#section-subtitle', {
            opacity: 0, y: 20, duration: 0.5
        }, '-=0.3');

        tl.from('.intro-line', {
            scaleX: 0, duration: 0.6, ease: 'power2.out'
        }, '-=0.3');

        // Stats cards stagger
        tl.from('.stat-card', {
            opacity: 0, y: 50, scale: 0.9,
            stagger: 0.1, duration: 0.5, ease: 'back.out(1.4)'
        }, '-=0.2');

        // Control bar
        tl.from('#control-bar', {
            opacity: 0, y: 30, duration: 0.5, ease: 'power3.out'
        }, '-=0.3');

        // Scoreboard
        tl.from('#scoreboard', {
            opacity: 0, y: 20, duration: 0.4
        }, '-=0.2');

        // Focus input
        tl.call(() => {
            const input = document.getElementById('player-name-input');
            if (input) input.focus();
        });

        createAmbientParticles();
    }

    // ---- Ambient particles ----
    function createAmbientParticles() {
        const container = document.getElementById('ambient-particles');
        if (!container) return;
        for (let i = 0; i < 30; i++) {
            const el = document.createElement('div');
            el.className = 'particle';
            const s = Math.random() * 2.5 + 0.5;
            el.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;opacity:${Math.random() * 0.12 + 0.03}`;
            container.appendChild(el);
            anime({
                targets: el,
                translateX: () => anime.random(-50, 50),
                translateY: () => anime.random(-80, 80),
                opacity: () => Math.random() * 0.1 + 0.03,
                duration: () => anime.random(4000, 8000),
                delay: () => anime.random(0, 3000),
                direction: 'alternate', loop: true, easing: 'easeInOutSine'
            });
        }
    }

    async function init() {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Hide scoreboard initially
        gsap.set('#app', { opacity: 0 });

        // Animate init screen elements
        createInitParticles();
        animateInitScreen();

        await preloadFrames();
        renderFrame(0);

        // Brief pause at 100% before cinematic starts
        setTimeout(() => {
            playCinematicSequence();
        }, 1000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
