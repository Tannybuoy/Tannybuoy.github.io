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
    var contactForm = document.getElementById('contactForm');
    var formStatus = document.getElementById('formStatus');

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

    // --- Initialize ---
    function init() {
        loadSavedMode();
        setupToggle();
        setupHamburger();
        setupSmoothScroll();
        setupScrollEffects();
        setupKonamiCode();
        updateFooterQuote();
        setupContactForm();
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

    // --- Contact Form Submission (Google Sheets via Apps Script) ---
    // HOW TO SET UP:
    // 1. Create a Google Sheet with columns: Timestamp, Name, Email, Topic, Message
    // 2. Go to Extensions > Apps Script and paste:
    //      function doPost(e) {
    //        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    //        var data = JSON.parse(e.postData.contents);
    //        sheet.appendRow([new Date(), data.name, data.email, data.topic, data.message]);
    //        return ContentService.createTextOutput(JSON.stringify({result: 'success'}))
    //          .setMimeType(ContentService.MimeType.JSON);
    //      }
    // 3. Deploy as Web App (Execute as: Me, Access: Anyone)
    // 4. Replace the URL below with your deployment URL
    var GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec';

    function setupContactForm() {
        if (!contactForm) return;

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Clear previous errors
            var inputs = contactForm.querySelectorAll('.form-input');
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].classList.remove('form-error');
            }
            formStatus.className = 'form-status';
            formStatus.textContent = '';

            // Gather values
            var name = document.getElementById('contactName').value.trim();
            var email = document.getElementById('contactEmail').value.trim();
            var topic = document.getElementById('contactTopic').value;
            var message = document.getElementById('contactMessage').value.trim();

            // Validate
            var valid = true;
            if (!name) {
                document.getElementById('contactName').classList.add('form-error');
                valid = false;
            }
            if (!email || !isValidEmail(email)) {
                document.getElementById('contactEmail').classList.add('form-error');
                valid = false;
            }
            if (!topic) {
                document.getElementById('contactTopic').classList.add('form-error');
                valid = false;
            }
            if (!message) {
                document.getElementById('contactMessage').classList.add('form-error');
                valid = false;
            }

            if (!valid) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please fill in all fields correctly.';
                return;
            }

            // Disable submit button
            var submitBtn = document.getElementById('contactSubmit');
            submitBtn.disabled = true;
            submitBtn.querySelector('.text-linkedin') && (submitBtn.querySelector('.text-linkedin').textContent = 'Sending...');
            submitBtn.querySelector('.text-unhinged') && (submitBtn.querySelector('.text-unhinged').textContent = 'Yeeting...');

            var payload = JSON.stringify({
                name: name,
                email: email,
                topic: topic,
                message: message
            });

            // Send to Google Sheets
            var xhr = new XMLHttpRequest();
            xhr.open('POST', GOOGLE_SHEETS_URL, true);
            xhr.setRequestHeader('Content-Type', 'text/plain');
            xhr.onload = function () {
                submitBtn.disabled = false;
                submitBtn.querySelector('.text-linkedin') && (submitBtn.querySelector('.text-linkedin').textContent = 'Send Message');
                submitBtn.querySelector('.text-unhinged') && (submitBtn.querySelector('.text-unhinged').textContent = 'Yeet This Message');

                if (xhr.status >= 200 && xhr.status < 400) {
                    formStatus.className = 'form-status success';
                    if (body.classList.contains('unhinged')) {
                        formStatus.textContent = 'Message yeeted successfully! I\'ll get back to you.';
                    } else {
                        formStatus.textContent = 'Message sent successfully! I\'ll be in touch soon.';
                    }
                    contactForm.reset();
                } else {
                    formStatus.className = 'form-status error';
                    formStatus.textContent = 'Something went wrong. Please try emailing me directly.';
                }
            };
            xhr.onerror = function () {
                submitBtn.disabled = false;
                submitBtn.querySelector('.text-linkedin') && (submitBtn.querySelector('.text-linkedin').textContent = 'Send Message');
                submitBtn.querySelector('.text-unhinged') && (submitBtn.querySelector('.text-unhinged').textContent = 'Yeet This Message');
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Network error. Please try emailing me directly.';
            };
            xhr.send(payload);
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

    // --- Run when DOM is ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
