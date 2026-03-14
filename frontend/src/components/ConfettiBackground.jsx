import { useEffect, useRef } from 'react';

const COLORS = [
    '#60a5fa', // blue
    '#a78bfa', // purple
    '#34d399', // green
    '#f472b6', // pink
    '#fb923c', // orange
    '#facc15', // yellow
    '#22d3ee', // cyan
    '#f87171', // red
];

function randomBetween(a, b) {
    return a + Math.random() * (b - a);
}

function createParticle(width, height) {
    return {
        x: randomBetween(0, width),
        y: randomBetween(0, height),
        w: randomBetween(4, 10),
        h: randomBetween(3, 7),
        rotation: randomBetween(0, 360),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: randomBetween(-0.15, 0.15),
        vy: randomBetween(-0.1, 0.1),
        opacity: randomBetween(0.4, 0.85),
    };
}

export default function ConfettiBackground({ count = 120 }) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const particlesRef = useRef([]);
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particlesRef.current = Array.from({ length: count }, () =>
                createParticle(canvas.width, canvas.height)
            );
        };

        resize();
        window.addEventListener('resize', resize);

        const onMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', onMouseMove);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((p) => {
                // Cursor repel effect
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const influenceRadius = 120;

                if (dist < influenceRadius && dist > 0) {
                    const force = (influenceRadius - dist) / influenceRadius;
                    p.vx += (dx / dist) * force * 0.6;
                    p.vy += (dy / dist) * force * 0.6;
                }

                // Damping — slow back to natural drift
                p.vx *= 0.96;
                p.vy *= 0.96;

                // Clamp velocity
                const maxSpeed = 3;
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > maxSpeed) {
                    p.vx = (p.vx / speed) * maxSpeed;
                    p.vy = (p.vy / speed) * maxSpeed;
                }

                p.x += p.vx;
                p.y += p.vy;
                p.rotation += 0.2;

                // Wrap edges
                if (p.x < -20) p.x = canvas.width + 20;
                if (p.x > canvas.width + 20) p.x = -20;
                if (p.y < -20) p.y = canvas.height + 20;
                if (p.y > canvas.height + 20) p.y = -20;

                // Draw rotated rectangle
                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 2);
                } else {
                    ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h);
                }
                ctx.fill();
                ctx.restore();
            });

            rafRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [count]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                opacity: 0.55,
            }}
        />
    );
}
