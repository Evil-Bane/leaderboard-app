/* ============================================
   SPLASH SCREEN — Animation Controller
   Uses GSAP Timeline + Anime.js Particles
   ============================================ */

(function () {
    'use strict';

    const PARTICLE_COUNT = 100;
    const AMBIENT_PARTICLE_COUNT = 40;

    // ---- Create Splash Particles ----
    function createSplashParticles() {
        const container = document.getElementById('splash-particles');
        const particles = [];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const el = document.createElement('div');
            el.className = 'particle';
            const size = Math.random() * 3 + 1;
            el.style.width = size + 'px';
            el.style.height = size + 'px';
            el.style.left = Math.random() * 100 + '%';
            el.style.top = Math.random() * 100 + '%';
            el.style.opacity = '0';
            container.appendChild(el);
            particles.push(el);
        }

        return particles;
    }

    // ---- Animate Floating Particles (Anime.js) ----
    function animateFloatingParticles(particles) {
        particles.forEach((p, i) => {
            // Fade in
            anime({
                targets: p,
                opacity: [0, Math.random() * 0.6 + 0.2],
                duration: 800,
                delay: i * 15,
                easing: 'easeOutQuad'
            });

            // Continuous floating
            anime({
                targets: p,
                translateX: () => anime.random(-80, 80),
                translateY: () => anime.random(-80, 80),
                duration: () => anime.random(3000, 6000),
                delay: () => anime.random(0, 2000),
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            });
        });
    }

    // ---- Converge Particles to Center ----
    function convergeParticles(particles) {
        return new Promise(resolve => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2 - 40;

            anime({
                targets: particles,
                left: centerX + 'px',
                top: (centerY - 20) + 'px',
                opacity: [{ value: 0.8, duration: 300 }],
                duration: 1200,
                delay: anime.stagger(8, { from: 'center' }),
                easing: 'easeInOutQuad',
                complete: resolve
            });
        });
    }

    // ---- Scatter Particles Away ----
    function scatterParticles(particles) {
        anime({
            targets: particles,
            left: () => anime.random(-10, 110) + '%',
            top: () => anime.random(-10, 110) + '%',
            opacity: () => Math.random() * 0.3 + 0.05,
            duration: 1500,
            delay: anime.stagger(5, { from: 'center' }),
            easing: 'easeOutQuad'
        });
    }

    // ---- Create Ambient Particles (for Scoreboard bg) ----
    function createAmbientParticles() {
        const container = document.getElementById('ambient-particles');
        if (!container) return;

        for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
            const el = document.createElement('div');
            el.className = 'particle';
            const size = Math.random() * 2.5 + 0.5;
            el.style.width = size + 'px';
            el.style.height = size + 'px';
            el.style.left = Math.random() * 100 + '%';
            el.style.top = Math.random() * 100 + '%';
            el.style.opacity = Math.random() * 0.2 + 0.05;
            container.appendChild(el);

            // Float
            anime({
                targets: el,
                translateX: () => anime.random(-60, 60),
                translateY: () => anime.random(-100, 100),
                opacity: () => Math.random() * 0.2 + 0.05,
                duration: () => anime.random(4000, 8000),
                delay: () => anime.random(0, 3000),
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            });
        }
    }

    // ---- GSAP Master Timeline ----
    function initSplashTimeline(particles) {
        const tl = gsap.timeline({
            defaults: { ease: 'power2.out' }
        });

        // Frame 1: Ambient glow
        tl.to('#splash-glow', {
            opacity: 1,
            duration: 1.5,
            ease: 'power1.inOut'
        }, 0);

        // Frame 1: Start particle convergence
        tl.add(() => convergeParticles(particles), 0.5);

        // Frame 2: Crown appears
        tl.to('#crown-svg', {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'elastic.out(1, 0.6)'
        }, 1.8);

        // Shockwave
        tl.fromTo('#shockwave',
            { scale: 0, opacity: 0.8 },
            { scale: 4, opacity: 0, duration: 1.2, ease: 'power2.out' },
            2.0
        );

        // Frame 2: Scatter particles to ambient
        tl.add(() => scatterParticles(particles), 2.2);

        // Frame 3: Title letters
        tl.to('#splash-title .letter', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: 'back.out(1.7)'
        }, 2.6);

        // Tagline
        tl.to('#splash-tagline', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, 3.3);

        // Enter button
        tl.to('#enter-btn', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, 3.6);

        // Crown float animation (infinite)
        tl.to('#crown-svg', {
            y: -8,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        }, 3);

        return tl;
    }

    // ---- Transition to Scoreboard ----
    function transitionToApp() {
        const tl = gsap.timeline({
            onComplete: () => {
                const splash = document.getElementById('splash-screen');
                splash.style.display = 'none';

                const app = document.getElementById('app');
                app.classList.remove('hidden');

                createAmbientParticles();
                revealApp();
            }
        });

        // Fade out splash content
        tl.to('#splash-content', {
            scale: 0.9,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in'
        });

        // Particles fly away
        tl.to('#splash-particles .particle', {
            opacity: 0,
            scale: 0,
            duration: 0.4,
            stagger: { each: 0.005, from: 'random' },
            ease: 'power2.in'
        }, 0.1);

        // Glow fades
        tl.to('#splash-glow', {
            opacity: 0,
            duration: 0.4,
        }, 0.2);

        // Splash screen slides up
        tl.to('#splash-screen', {
            yPercent: -100,
            duration: 0.7,
            ease: 'power3.inOut'
        }, 0.4);
    }

    // ---- Reveal Scoreboard App ----
    function revealApp() {
        const tl = gsap.timeline();

        // Control bar slides in
        tl.from('#control-bar', {
            y: -80,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out'
        }, 0.1);

        // App glow
        tl.from('#app-glow', {
            opacity: 0,
            duration: 1,
        }, 0);

        // Empty state
        tl.from('#empty-state', {
            y: 40,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, 0.4);

        // Input focus hint
        tl.add(() => {
            setTimeout(() => {
                const input = document.getElementById('player-name-input');
                if (input) input.focus();
            }, 300);
        }, 0.8);
    }

    // ---- Init ----
    function init() {
        const particles = createSplashParticles();
        animateFloatingParticles(particles);

        // Small delay to let particles render
        setTimeout(() => {
            initSplashTimeline(particles);
        }, 200);

        // Enter button handler
        const enterBtn = document.getElementById('enter-btn');
        enterBtn.addEventListener('click', () => {
            enterBtn.disabled = true;
            transitionToApp();
        });

        // Also allow Enter key on splash
        document.addEventListener('keydown', function splashKey(e) {
            if (e.key === 'Enter' && document.getElementById('splash-screen').style.display !== 'none') {
                enterBtn.disabled = true;
                transitionToApp();
                document.removeEventListener('keydown', splashKey);
            }
        });
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for app.js
    window.ArenaParticles = { createAmbientParticles };
})();
