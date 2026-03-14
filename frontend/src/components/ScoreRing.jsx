import React, { useMemo } from 'react';

/**
 * ScoreRing component that displays a circular progress ring with a score.
 * @param {Object} props - Component props
 * @param {number} props.score - The profile score (0-100)
 * @returns {JSX.Element}
 */
const ScoreRing = ({ score }) => {
    const getScoreGradient = useMemo(() => (value) => {
        if (value <= 40) return { from: '#fb923c', to: '#ef4444' };
        if (value <= 69) return { from: '#facc15', to: '#fb923c' };
        if (value <= 84) return { from: '#facc15', to: '#22c55e' };
        return { from: '#22c55e', to: '#22d3ee' };
    }, []);

    const { from: scoreFrom, to: scoreTo } = getScoreGradient(score);
    
    // SVG values
    const radius = 82;
    const circumference = 2 * Math.PI * radius; // ~515

    return (
        <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <defs>
                    <linearGradient id="score-ring-gradient-comp" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={scoreFrom} />
                        <stop offset="100%" stopColor={scoreTo} />
                    </linearGradient>
                </defs>
                <circle
                    cx="88" cy="88" r={radius}
                    fill="none"
                    className="stroke-gray-800/50"
                    strokeWidth="10"
                />
                <circle
                    cx="88" cy="88" r={radius}
                    fill="none"
                    stroke="url(#score-ring-gradient-comp)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * score) / 100}
                    style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                />
            </svg>
            <div className="z-10 flex flex-col items-center">
                <div className="flex items-baseline font-black leading-none">
                    <span className="text-6xl tracking-tight" style={{ color: scoreFrom }}>
                        {score}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ScoreRing;
