/**
 * Animated Gradient Mesh — Canvas-rendered aurora blobs
 * Stripe/Linear-inspired. Mouse-reactive color flow.
 */
(function () {
    const canvas = document.getElementById('gradientCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    // Accent palette
    const colors = [
        { r: 124, g: 92,  b: 255 }, // violet
        { r: 34,  g: 211, b: 238 }, // cyan
        { r: 212, g: 255, b: 79  }, // lime
        { r: 255, g: 122, b: 89  }, // coral
    ];

    let blobs = [];
    let mouse = { x: 0, y: 0, active: false };
    let w, h;

    function resize() {
        const parent = canvas.parentElement;
        w = parent.offsetWidth || window.innerWidth;
        h = parent.offsetHeight || window.innerHeight;
        canvas.width = w * DPR;
        canvas.height = h * DPR;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(DPR, DPR);
    }

    class Blob {
        constructor(i) {
            this.i = i;
            this.color = colors[i % colors.length];
            this.baseR = 280 + Math.random() * 180;
            this.r = this.baseR;
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = (Math.random() - 0.5) * 0.0008;
            this.orbitR = 180 + Math.random() * 180;
            this.cx = w / 2 + (Math.random() - 0.5) * 200;
            this.cy = h / 2 + (Math.random() - 0.5) * 200;
            this.x = this.cx;
            this.y = this.cy;
            this.phase = Math.random() * Math.PI * 2;
        }

        update(t) {
            this.angle += this.angleSpeed;
            this.phase += 0.003;
            // Slow orbital drift
            this.x = this.cx + Math.cos(this.angle) * this.orbitR + Math.sin(this.phase) * 40;
            this.y = this.cy + Math.sin(this.angle * 1.3) * this.orbitR * 0.7 + Math.cos(this.phase * 1.2) * 30;

            // Slight mouse attraction
            if (mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const pull = Math.min(80, 30000 / (dist + 100));
                this.x += (dx / dist) * pull * 0.01;
                this.y += (dy / dist) * pull * 0.01;
                this.r = this.baseR + (200 - Math.min(dist, 200)) * 0.3;
            } else {
                this.r += (this.baseR - this.r) * 0.05;
            }
        }

        draw() {
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
            const { r, g: gc, b } = this.color;
            g.addColorStop(0, `rgba(${r}, ${gc}, ${b}, 0.55)`);
            g.addColorStop(0.4, `rgba(${r}, ${gc}, ${b}, 0.25)`);
            g.addColorStop(1, `rgba(${r}, ${gc}, ${b}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        blobs = [];
        // 4 blobs spread across hero
        const positions = [
            { x: w * 0.25, y: h * 0.3 },
            { x: w * 0.75, y: h * 0.35 },
            { x: w * 0.4,  y: h * 0.75 },
            { x: w * 0.8,  y: h * 0.8 },
        ];
        for (let i = 0; i < 4; i++) {
            const b = new Blob(i);
            b.cx = positions[i].x;
            b.cy = positions[i].y;
            b.x = b.cx;
            b.y = b.cy;
            blobs.push(b);
        }
    }

    function animate(t) {
        ctx.clearRect(0, 0, w, h);

        // Soft dark base wash
        const base = ctx.createLinearGradient(0, 0, 0, h);
        base.addColorStop(0, '#0a0b10');
        base.addColorStop(1, '#0a0b10');
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, w, h);

        // Composite blobs with screen blend for aurora effect
        ctx.globalCompositeOperation = 'screen';
        blobs.forEach(b => {
            b.update(t);
            b.draw();
        });
        ctx.globalCompositeOperation = 'source-over';

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', init);

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = mouse.y > 0 && mouse.y < h;
    });

    window.addEventListener('mouseleave', () => { mouse.active = false; });

    // Wait for layout to settle
    function start() {
        init();
        requestAnimationFrame(animate);
    }

    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start);
    }
})();
