/* ============================================
   PM Portfolio - Toggle & Interactions
   ============================================ */

(function () {
    'use strict';

    // --- State ---
    var toggleCount = 0;
    var easterEggShown = false;

    // --- DOM Elements ---
    var body = document.body;
    var modeToggle = document.getElementById('modeToggle');
    var toast = document.getElementById('toast');
    var backToTop = document.getElementById('backToTop');
    var navHamburger = document.getElementById('navHamburger');
    var navLinks = document.getElementById('navLinks');
    var footerQuote = document.getElementById('footerQuote');

    // --- PM Quotes (for UNHINGED footer) ---
    var pmQuotes = [
        '"The roadmap is a suggestion, not a promise." — Every PM internally',
        '"Stakeholder alignment is just a polite way of saying everyone agreed to disagree."',
        '"The MVP was supposed to be minimal. It\'s now 47 features."',
        '"Let\'s take this offline" is PM for "I have no idea either."',
        '"We don\'t have technical debt. We have technical student loans."',
        '"The sprint ended. The work did not."',
        '"I didn\'t choose the PM life. I just kept saying yes in meetings."',
        '"Our velocity is great if you don\'t count the things that aren\'t done."',
        '"Cross-functional collaboration = 14 people in a Zoom call where 2 talk."',
        '"Data-driven means the data agreed with what we already decided."',
        '"Agile is whatever we say it is this quarter."',
        '"The user story was clear. The implementation was an interpretation."'
    ];

    // --- Konami Code State ---
    var konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    var konamiIndex = 0;

    // --- Intro Animation (once per session) ---
    var introTileData = [
        { emoji: '🔍', label: 'Problem',   bg: '#FFF5EB', color: '#4A2800' },
        { emoji: '🩵', label: 'Empathy',   bg: '#FFE8D4', color: '#4A2800' },
        { emoji: '👤', label: 'User',      bg: '#FFD4B0', color: '#4A2800' },
        { emoji: '💡', label: 'Insight',   bg: '#FFBB80', color: '#4A2800' },
        { emoji: '📊', label: 'Market',    bg: '#FF9A4D', color: '#FFFFFF' },
        { emoji: '🧠', label: 'Ideate',    bg: '#FF6A1A', color: '#FFFFFF' },
        { emoji: '🔧', label: 'Prototype', bg: '#E04500', color: '#FFFFFF' },
        { emoji: '🧪', label: 'Test',      bg: '#C03A00', color: '#FFFFFF' },
        { emoji: '📈', label: 'Metric',    bg: '#9A2E00', color: '#FFFFFF' },
        { emoji: '🌟', label: 'Product',   bg: '#742200', color: '#FFFFFF' },
        { emoji: '🚀', label: 'Launch',    bg: '#4A1500', color: '#FFFFFF' }
    ];

    function runIntroAnimation() {
        var introOverlay = document.getElementById('introOverlay');
        var introTiles = document.getElementById('introTiles');
        if (!introOverlay || !introTiles) return false;

        var shouldShow = false;
        try {
            shouldShow = !sessionStorage.getItem('intro-shown');
        } catch (e) {
            return false;
        }

        if (!shouldShow) {
            introOverlay.parentNode.removeChild(introOverlay);
            return false;
        }

        // Mark as shown
        try { sessionStorage.setItem('intro-shown', '1'); } catch (e) {}

        // Lock scrolling
        body.classList.add('intro-active');

        // Create tile elements
        var tileEls = [];
        for (var i = 0; i < introTileData.length; i++) {
            var data = introTileData[i];
            var tile = document.createElement('div');
            tile.className = 'intro-tile';
            tile.style.backgroundColor = data.bg;
            tile.style.color = data.color;
            tile.innerHTML = '<div class="intro-tile-emoji">' + data.emoji + '</div>' +
                             '<div class="intro-tile-label">' + data.label + '</div>';
            introTiles.appendChild(tile);
            tileEls.push(tile);
        }

        // Stagger tile appearances
        var delay = 120;
        for (var j = 0; j < tileEls.length; j++) {
            (function (el, index) {
                setTimeout(function () {
                    el.classList.add('visible');
                }, delay * index);
            })(tileEls[j], j);
        }

        // After all tiles appear, pause, then type tagline, then open curtains
        var tilesFinishTime = delay * tileEls.length + 1000;
        var taglineText = "Let's Build Together";
        var typeSpeed = 60;
        var taglineEl = document.getElementById('introTagline');

        setTimeout(function () {
            if (!taglineEl) {
                introOverlay.classList.add('opening');
                setTimeout(function () {
                    body.classList.remove('intro-active');
                    introOverlay.parentNode.removeChild(introOverlay);
                }, 700);
                return;
            }

            // Add cursor
            var cursor = document.createElement('span');
            cursor.className = 'intro-cursor';
            taglineEl.appendChild(cursor);

            // Type characters one by one
            var charIndex = 0;
            var textNode = document.createTextNode('');
            taglineEl.insertBefore(textNode, cursor);

            var typeInterval = setInterval(function () {
                if (charIndex < taglineText.length) {
                    textNode.nodeValue += taglineText[charIndex];
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    // Pause after typing finishes, then open
                    setTimeout(function () {
                        introOverlay.classList.add('opening');
                    }, 1000);
                    setTimeout(function () {
                        body.classList.remove('intro-active');
                        introOverlay.parentNode.removeChild(introOverlay);
                    }, 1000 + 700);
                }
            }, typeSpeed);
        }, tilesFinishTime);

        return true;
    }

    // --- Initialize ---
    function init() {
        runIntroAnimation();
        loadSavedMode();
        setupToggle();
        setupHamburger();
        setupSmoothScroll();
        setupScrollEffects();
        setupKonamiCode();
        updateFooterQuote();
        initFloatingTiles();
    }

    // --- Load saved mode from localStorage ---
    function loadSavedMode() {
        try {
            var saved = localStorage.getItem('pm-portfolio-mode');
            if (saved === 'unhinged') {
                body.classList.add('unhinged');
                modeToggle.setAttribute('aria-checked', 'true');
            }
        } catch (e) {
            // localStorage unavailable
        }
    }

    // --- Toggle Setup ---
    function setupToggle() {
        modeToggle.addEventListener('click', function () {
            var isUnhinged = body.classList.toggle('unhinged');

            modeToggle.setAttribute('aria-checked', String(isUnhinged));

            // Save preference
            try {
                localStorage.setItem('pm-portfolio-mode', isUnhinged ? 'unhinged' : 'linkedin');
            } catch (e) {
                // localStorage unavailable
            }

            // Track toggles for easter egg
            toggleCount++;
            if (toggleCount >= 6 && !easterEggShown) {
                showToast();
                easterEggShown = true;
            }

            // Update footer quote on toggle
            updateFooterQuote();

            // Announce mode change for screen readers
            announceMode(isUnhinged);

        });
    }

    // --- Announce mode for screen readers ---
    function announceMode(isUnhinged) {
        var announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = isUnhinged
            ? 'Switched to UNHINGED Mode'
            : 'Switched to LinkedIn Mode';
        body.appendChild(announcement);
        setTimeout(function () {
            body.removeChild(announcement);
        }, 1000);
    }

    // --- Toast Notification ---
    function showToast() {
        toast.classList.add('show');
        setTimeout(function () {
            toast.classList.remove('show');
        }, 4000);
    }

    // --- Footer Quote ---
    function updateFooterQuote() {
        if (!footerQuote) return;
        var isUnhinged = body.classList.contains('unhinged');
        if (isUnhinged) {
            var randomIndex = Math.floor(Math.random() * pmQuotes.length);
            footerQuote.textContent = pmQuotes[randomIndex];
            footerQuote.style.opacity = '0';
            setTimeout(function () {
                footerQuote.style.opacity = '1';
            }, 50);
        } else {
            footerQuote.textContent = '';
        }
    }

    // --- Hamburger Menu ---
    function setupHamburger() {
        if (!navHamburger || !navLinks) return;

        navHamburger.addEventListener('click', function () {
            var isActive = navHamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            navHamburger.setAttribute('aria-expanded', String(isActive));
        });

        // Close menu when a link is clicked
        var links = navLinks.querySelectorAll('.nav-link');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function () {
                navHamburger.classList.remove('active');
                navLinks.classList.remove('active');
                navHamburger.setAttribute('aria-expanded', 'false');
            });
        }
    }

    // --- Smooth Scroll ---
    function setupSmoothScroll() {
        var anchors = document.querySelectorAll('a[href^="#"]');
        for (var i = 0; i < anchors.length; i++) {
            anchors[i].addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    var navHeight = parseInt(getComputedStyle(document.documentElement)
                        .getPropertyValue('--nav-height')) || 72;
                    var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    // --- Scroll Effects ---
    function setupScrollEffects() {
        // Back to top button
        var scrollHandler = function () {
            if (window.pageYOffset > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', throttle(scrollHandler, 100));

        // Scroll reveal
        var revealElements = document.querySelectorAll('.section');
        for (var i = 0; i < revealElements.length; i++) {
            revealElements[i].classList.add('reveal');
        }

        var revealHandler = function () {
            var reveals = document.querySelectorAll('.reveal');
            for (var i = 0; i < reveals.length; i++) {
                var windowHeight = window.innerHeight;
                var elementTop = reveals[i].getBoundingClientRect().top;
                var revealPoint = 120;

                if (elementTop < windowHeight - revealPoint) {
                    reveals[i].classList.add('visible');
                }
            }
        };

        window.addEventListener('scroll', throttle(revealHandler, 100));

        // Run once on load
        scrollHandler();
        revealHandler();
    }

    // --- Konami Code Easter Egg ---
    function setupKonamiCode() {
        document.addEventListener('keydown', function (e) {
            if (e.code === konamiSequence[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiSequence.length) {
                    activateMaximumUnhinged();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }

    function activateMaximumUnhinged() {
        // Force unhinged mode
        if (!body.classList.contains('unhinged')) {
            body.classList.add('unhinged');
            modeToggle.setAttribute('aria-checked', 'true');
            try {
                localStorage.setItem('pm-portfolio-mode', 'unhinged');
            } catch (e) {}
        }

        // Brief screen shake
        body.style.animation = 'shake 0.5s ease';
        setTimeout(function () {
            body.style.animation = '';
        }, 500);

        // Show special toast
        toast.textContent = 'MAXIMUM UNHINGED MODE ACTIVATED. There is no going back. (Just kidding, toggle still works.)';
        showToast();

        // Add temporary extra rotations to cards
        var cards = document.querySelectorAll('.project-card');
        for (var i = 0; i < cards.length; i++) {
            var deg = (Math.random() - 0.5) * 6;
            cards[i].style.transform = 'rotate(' + deg + 'deg)';
        }

        // Reset after a few seconds
        setTimeout(function () {
            for (var i = 0; i < cards.length; i++) {
                cards[i].style.transform = '';
            }
            // Reset toast text
            toast.textContent = "Can't decide which version is real? Both are. Welcome to Product Management.";
        }, 5000);

        updateFooterQuote();
    }

    // --- Utility: Throttle ---
    function throttle(fn, wait) {
        var lastTime = 0;
        return function () {
            var now = Date.now();
            if (now - lastTime >= wait) {
                lastTime = now;
                fn.apply(this, arguments);
            }
        };
    }

    // --- Add shake animation dynamically ---
    var style = document.createElement('style');
    style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-4px)}20%,40%,60%,80%{transform:translateX(4px)}}';
    document.head.appendChild(style);

    // ============================================
    //  Draggable Floating Tiles with Bounce Physics
    // ============================================
    function initFloatingTiles() {
        var container = document.querySelector('.floating-tiles');
        if (!container) return;

        var tiles = container.querySelectorAll('.floating-tile');
        if (!tiles.length) return;

        var TILE_SIZE = 84;
        var FRICTION = 0.98;
        var MIN_SPEED = 0.1;
        var IDLE_SPEED = 0.4;
        var tileStates = [];
        var animFrameId = null;

        // Convert percentage/CSS positions to absolute pixel positions
        function resolveInitialPosition(tile, idx) {
            var rect = tile.getBoundingClientRect();
            var containerRect = container.getBoundingClientRect();
            var x = rect.left - containerRect.left;
            var y = rect.top - containerRect.top;
            // Clamp inside container
            var maxX = container.clientWidth - TILE_SIZE;
            var maxY = container.clientHeight - TILE_SIZE;
            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));
            return { x: x, y: y };
        }

        // Set up each tile
        for (var i = 0; i < tiles.length; i++) {
            var pos = resolveInitialPosition(tiles[i], i);
            // Random gentle velocity
            var angle = Math.random() * Math.PI * 2;
            tileStates.push({
                el: tiles[i],
                x: pos.x,
                y: pos.y,
                vx: Math.cos(angle) * IDLE_SPEED,
                vy: Math.sin(angle) * IDLE_SPEED,
                isDragging: false,
                dragOffsetX: 0,
                dragOffsetY: 0,
                rotation: 0,
                rotTarget: 0
            });
            // Clear CSS positioning — JS handles it now
            tiles[i].style.left = '';
            tiles[i].style.right = '';
            tiles[i].style.top = '';
            tiles[i].style.bottom = '';
            tiles[i].style.position = 'absolute';
            tiles[i].style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
        }

        // --- Pointer event handlers (mouse + touch) ---
        function getPointerPos(e) {
            if (e.touches && e.touches.length) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            return { x: e.clientX, y: e.clientY };
        }

        function onPointerDown(e) {
            // Find which tile
            var target = e.target;
            while (target && target !== container) {
                for (var i = 0; i < tileStates.length; i++) {
                    if (tileStates[i].el === target) {
                        startDrag(i, e);
                        return;
                    }
                }
                target = target.parentElement;
            }
        }

        var activeDragIdx = -1;
        var lastPointer = { x: 0, y: 0 };
        var prevPointer = { x: 0, y: 0 };

        function startDrag(idx, e) {
            e.preventDefault();
            var state = tileStates[idx];
            var pos = getPointerPos(e);
            var containerRect = container.getBoundingClientRect();
            state.isDragging = true;
            state.el.classList.add('is-dragging');
            state.dragOffsetX = pos.x - containerRect.left - state.x;
            state.dragOffsetY = pos.y - containerRect.top - state.y;
            state.vx = 0;
            state.vy = 0;
            activeDragIdx = idx;
            lastPointer = { x: pos.x, y: pos.y };
            prevPointer = { x: pos.x, y: pos.y };

            document.addEventListener('mousemove', onPointerMove);
            document.addEventListener('mouseup', onPointerUp);
            document.addEventListener('touchmove', onPointerMove, { passive: false });
            document.addEventListener('touchend', onPointerUp);
        }

        function onPointerMove(e) {
            if (activeDragIdx < 0) return;
            e.preventDefault();
            var pos = getPointerPos(e);
            prevPointer = { x: lastPointer.x, y: lastPointer.y };
            lastPointer = { x: pos.x, y: pos.y };
            var containerRect = container.getBoundingClientRect();
            var state = tileStates[activeDragIdx];
            var maxX = container.clientWidth - TILE_SIZE;
            var maxY = container.clientHeight - TILE_SIZE;
            state.x = Math.max(0, Math.min(pos.x - containerRect.left - state.dragOffsetX, maxX));
            state.y = Math.max(0, Math.min(pos.y - containerRect.top - state.dragOffsetY, maxY));
        }

        function onPointerUp(e) {
            if (activeDragIdx < 0) return;
            var state = tileStates[activeDragIdx];
            state.isDragging = false;
            state.el.classList.remove('is-dragging');
            // Fling velocity from last two pointer positions
            var pos = getPointerPos(e.changedTouches ? e : e);
            state.vx = (lastPointer.x - prevPointer.x) * 0.3;
            state.vy = (lastPointer.y - prevPointer.y) * 0.3;
            // Cap fling speed
            var maxFling = 8;
            state.vx = Math.max(-maxFling, Math.min(state.vx, maxFling));
            state.vy = Math.max(-maxFling, Math.min(state.vy, maxFling));
            activeDragIdx = -1;
            document.removeEventListener('mousemove', onPointerMove);
            document.removeEventListener('mouseup', onPointerUp);
            document.removeEventListener('touchmove', onPointerMove);
            document.removeEventListener('touchend', onPointerUp);
        }

        container.addEventListener('mousedown', onPointerDown);
        container.addEventListener('touchstart', onPointerDown, { passive: false });

        // --- Physics animation loop ---
        function tick() {
            var maxX = container.clientWidth - TILE_SIZE;
            var maxY = container.clientHeight - TILE_SIZE;

            for (var i = 0; i < tileStates.length; i++) {
                var s = tileStates[i];
                if (s.isDragging) {
                    s.el.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) scale(1.1)';
                    continue;
                }

                // Apply velocity
                s.x += s.vx;
                s.y += s.vy;

                // Bounce off walls
                if (s.x <= 0) { s.x = 0; s.vx = Math.abs(s.vx); }
                if (s.x >= maxX) { s.x = maxX; s.vx = -Math.abs(s.vx); }
                if (s.y <= 0) { s.y = 0; s.vy = Math.abs(s.vy); }
                if (s.y >= maxY) { s.y = maxY; s.vy = -Math.abs(s.vy); }

                // Friction
                s.vx *= FRICTION;
                s.vy *= FRICTION;

                // When nearly stopped, give a gentle random nudge to keep them floating
                var speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
                if (speed < MIN_SPEED) {
                    var angle = Math.random() * Math.PI * 2;
                    s.vx = Math.cos(angle) * IDLE_SPEED;
                    s.vy = Math.sin(angle) * IDLE_SPEED;
                }

                // Gentle rotation based on horizontal velocity
                s.rotTarget = s.vx * 2;
                s.rotation += (s.rotTarget - s.rotation) * 0.1;

                s.el.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) rotate(' + s.rotation.toFixed(1) + 'deg)';
            }

            animFrameId = requestAnimationFrame(tick);
        }

        tick();

        // Recalculate on resize
        window.addEventListener('resize', throttle(function () {
            var maxX = container.clientWidth - TILE_SIZE;
            var maxY = container.clientHeight - TILE_SIZE;
            for (var i = 0; i < tileStates.length; i++) {
                tileStates[i].x = Math.min(tileStates[i].x, maxX);
                tileStates[i].y = Math.min(tileStates[i].y, maxY);
            }
        }, 200));
    }

    // --- Run when DOM is ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
