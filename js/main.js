/**
 * IWinALot — Main JS
 * Custom cursor · magnetic buttons · tilt · scroll reveals · counters · carousel · form
 */
(function () {
    'use strict';

    const isTouchDevice = matchMedia('(pointer: coarse)').matches;

    // ========================================
    // CUSTOM CURSOR
    // ========================================
    if (!isTouchDevice) {
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        let mx = 0, my = 0, rx = 0, ry = 0;

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        });

        function animateRing() {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover state
        document.querySelectorAll('[data-hover]').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
        });

        // Hide cursor when leaving window
        window.addEventListener('mouseleave', () => {
            dot.style.opacity = 0;
            ring.style.opacity = 0;
        });
        window.addEventListener('mouseenter', () => {
            dot.style.opacity = 1;
            ring.style.opacity = 1;
        });
    }

    // ========================================
    // MAGNETIC BUTTONS
    // ========================================
    if (!isTouchDevice) {
        document.querySelectorAll('[data-magnetic]').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // ========================================
    // SERVICE CARD — Spotlight follow
    // ========================================
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mx', `${x}px`);
            card.style.setProperty('--my', `${y}px`);
        });
    });

    // ========================================
    // DASHBOARD 3D TILT
    // ========================================
    const dashboard = document.getElementById('dashboard3d');
    if (dashboard && !isTouchDevice) {
        const wrap = dashboard.parentElement;
        wrap.addEventListener('mousemove', (e) => {
            const rect = wrap.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            dashboard.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 10}deg)`;
        });
        wrap.addEventListener('mouseleave', () => {
            dashboard.style.transform = 'rotateX(8deg) rotateY(-2deg)';
        });
    }

    // ========================================
    // NAV
    // ========================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    // ========================================
    // SCROLL REVEAL (IntersectionObserver)
    // ========================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ========================================
    // ANIMATED COUNTERS
    // ========================================
    const counters = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                counters.forEach(counter => {
                    const target = parseFloat(counter.getAttribute('data-target'));
                    const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
                    const duration = 2200;
                    const start = performance.now();

                    function update(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const val = eased * target;
                        counter.textContent = decimals > 0 ? val.toFixed(decimals) : Math.floor(val);
                        if (progress < 1) requestAnimationFrame(update);
                        else counter.textContent = decimals > 0 ? target.toFixed(decimals) : target;
                    }
                    requestAnimationFrame(update);
                });
                counterObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) counterObserver.observe(statsGrid);

    // AUM big number counter
    const aum = document.getElementById('auMoney');
    if (aum) {
        const aumObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = 2.47;
                    const duration = 2000;
                    const start = performance.now();
                    function step(now) {
                        const p = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - p, 3);
                        aum.textContent = (eased * target).toFixed(2);
                        if (p < 1) requestAnimationFrame(step);
                        else aum.textContent = target.toFixed(2);
                    }
                    requestAnimationFrame(step);
                    aumObserver.disconnect();
                }
            });
        }, { threshold: 0.4 });
        aumObserver.observe(aum);
    }

    // ========================================
    // TESTIMONIAL CAROUSEL
    // ========================================
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    const testimonialCount = document.getElementById('testimonialCount');
    let current = 0;
    let autoRotate;

    function showTestimonial(i) {
        testimonialCards.forEach(c => c.classList.remove('active'));
        testimonialDots.forEach(d => d.classList.remove('active'));
        testimonialCards[i].classList.add('active');
        testimonialDots[i].classList.add('active');
        current = i;
        if (testimonialCount) {
            testimonialCount.textContent = `${String(i + 1).padStart(2, '0')} / ${String(testimonialCards.length).padStart(2, '0')}`;
        }
    }

    testimonialDots.forEach(dot => {
        dot.addEventListener('click', () => {
            showTestimonial(parseInt(dot.getAttribute('data-index'), 10));
            resetAuto();
        });
    });

    function startAuto() {
        autoRotate = setInterval(() => {
            showTestimonial((current + 1) % testimonialCards.length);
        }, 6000);
    }
    function resetAuto() { clearInterval(autoRotate); startAuto(); }
    if (testimonialCards.length > 0) startAuto();

    // ========================================
    // CONTACT FORM
    // ========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('#name').value.trim();
            const email = contactForm.querySelector('#email').value.trim();
            const message = contactForm.querySelector('#message').value.trim();
            if (!name || !email || !message) return;

            const wrapper = contactForm.parentElement;
            wrapper.innerHTML = `
                <div class="form-success">
                    <div class="form-success-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3>Message received</h3>
                    <p>Thanks, ${name}. We'll be in touch within 24 hours.</p>
                </div>
            `;
        });
    }

    // ========================================
    // SMOOTH SCROLL (anchor)
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
})();
