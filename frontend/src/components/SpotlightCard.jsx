import React, { useRef, useState, useEffect } from 'react';

/**
 * SpotlightCard component that creates a mouse-following glow effect.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.glowColor='blue'] - Color of the glow (blue, cyan, purple, etc.)
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element}
 */
const SpotlightCard = ({ children, glowColor = 'blue', className = '' }) => {
    const containerRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    const getGlowColor = () => {
        const colors = {
            blue: 'rgba(59, 130, 246, 0.15)',
            cyan: 'rgba(6, 182, 212, 0.15)',
            purple: 'rgba(168, 85, 247, 0.15)',
            pink: 'rgba(236, 72, 153, 0.15)',
            indigo: 'rgba(99, 102, 241, 0.15)',
        };
        return colors[glowColor] || colors.blue;
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative group rounded-[2.5rem] border border-white/5 bg-[#0f0f15]/80 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/10 ${className}`}
        >
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${getGlowColor()}, transparent 40%)`,
                }}
            />
            <div className="relative z-10 h-full flex flex-col">
                {children}
            </div>
        </div>
    );
};

export default SpotlightCard;
