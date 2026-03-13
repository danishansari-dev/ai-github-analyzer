import { useEffect, useRef } from 'react';

/**
 * FloatingParticlesBackground component
 * Creates an interactive background with drifting particles using HTML5 Canvas.
 * 
 * @param {Object} props
 * @param {number} props.particleCount - Number of particles to spawn
 * @param {number} props.particleSize - Base size of particles
 * @param {number} props.particleOpacity - Default opacity of particles
 * @param {number} props.glowIntensity - Maximum glow factor when near mouse
 * @param {number} props.movementSpeed - Base drift speed multiplier
 * @param {number} props.mouseInfluence - Radius of mouse interaction (px)
 * @param {string} props.backgroundColor - Canvas background color
 * @param {string} props.particleColor - Hex or CSS color for particles
 * @param {'attract'|'repel'} props.mouseGravity - Direction of mouse force
 * @param {number} props.gravityStrength - Strength of the mouse force
 */
const FloatingParticlesBackground = ({
    particleCount = 60,
    particleSize = 2,
    particleOpacity = 0.5,
    glowIntensity = 10,
    movementSpeed = 0.4,
    mouseInfluence = 120,
    backgroundColor = 'transparent',
    particleColor = '#60a5fa',
    mouseGravity = 'repel',
    gravityStrength = 50,
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const requestRef = useRef();
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const particlesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;

        /**
         * Individual particle class to manage state and rendering logic.
         * Why: Encapsulating particle behavior keeps the main loop clean.
         */
        class Particle {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * movementSpeed;
                this.vy = (Math.random() - 0.5) * movementSpeed;
                this.baseSize = Math.random() * particleSize + 1;
                this.size = this.baseSize;
                this.alpha = particleOpacity;
            }

            update() {
                // Natural movement
                this.x += this.vx;
                this.y += this.vy;

                // Mouse interaction logic
                const dx = mouseRef.current.x - this.x;
                const dy = mouseRef.current.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseInfluence) {
                    // Interaction: Glow
                    const force = (mouseInfluence - distance) / mouseInfluence;
                    this.alpha = Math.min(1, particleOpacity + force * (glowIntensity / 10));
                    this.size = this.baseSize + force * 2;

                    // Interaction: Gravity (Attract/Repel)
                    const angle = Math.atan2(dy, dx);
                    const gravity = (force * gravityStrength) / 100;
                    
                    if (mouseGravity === 'repel') {
                        this.x -= Math.cos(angle) * gravity;
                        this.y -= Math.sin(angle) * gravity;
                    } else {
                        this.x += Math.cos(angle) * gravity;
                        this.y += Math.sin(angle) * gravity;
                    }
                } else {
                    this.alpha = particleOpacity;
                    this.size = this.baseSize;
                }

                // Boundary wrapping (not bouncing)
                // Why: Creates a seamless infinite space feel.
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.globalAlpha = this.alpha;
                ctx.fill();
            }
        }

        const resize = () => {
            if (!containerRef.current) return;
            width = containerRef.current.clientWidth;
            height = containerRef.current.clientHeight;
            canvas.width = width;
            canvas.height = height;
            
            // Re-initialize particles on major resize to avoid empty gaps
            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push(new Particle());
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            if (backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, width, height);
            }

            particlesRef.current.forEach(p => {
                p.update();
                p.draw();
            });
            requestRef.current = requestAnimationFrame(render);
        };

        // ResizeObserver to handle container scaling properly
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(containerRef.current);
        
        resize();
        render();

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cancelAnimationFrame(requestRef.current);
            resizeObserver.disconnect();
            window.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [particleCount, particleSize, particleOpacity, glowIntensity, movementSpeed, mouseInfluence, backgroundColor, particleColor, mouseGravity, gravityStrength]);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%', 
                overflow: 'hidden',
                pointerEvents: 'none', // Allow clicking through to underlying content
                zIndex: 0
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ 
                    display: 'block',
                    pointerEvents: 'auto' // Re-enable pointer events for mouse hover detection
                }}
            />
        </div>
    );
};

export default FloatingParticlesBackground;
