import { useState, useEffect, useRef } from 'react';

const SKILL_COLORS = {
    'JavaScript': { color: '#F7DF1E', textColor: '#000000', abbrev: 'JS' },
    'TypeScript': { color: '#3178C6', textColor: '#FFFFFF', abbrev: 'TS' },
    'Python': { color: '#3776AB', textColor: '#FFFFFF', abbrev: 'PY' },
    'React': { color: '#61DAFB', textColor: '#0B1120', abbrev: 'RC' },
    'Vue': { color: '#42B883', textColor: '#FFFFFF', abbrev: 'VU' },
    'Node.js': { color: '#339933', textColor: '#FFFFFF', abbrev: 'ND' },
    'HTML': { color: '#E34F26', textColor: '#FFFFFF', abbrev: 'HT' },
    'CSS': { color: '#1572B6', textColor: '#FFFFFF', abbrev: 'CS' },
    'Tailwind': { color: '#06B6D4', textColor: '#FFFFFF', abbrev: 'TW' },
    'Go': { color: '#00ADD8', textColor: '#FFFFFF', abbrev: 'GO' },
    'Rust': { color: '#CE422B', textColor: '#FFFFFF', abbrev: 'RS' },
    'Java': { color: '#ED8B00', textColor: '#FFFFFF', abbrev: 'JV' },
    'C++': { color: '#00599C', textColor: '#FFFFFF', abbrev: 'C+' },
    'Docker': { color: '#2496ED', textColor: '#FFFFFF', abbrev: 'DK' },
    'Git': { color: '#F05032', textColor: '#FFFFFF', abbrev: 'GT' },
    'Jupyter Notebook': { color: '#F37626', textColor: '#FFFFFF', abbrev: 'JN' },
    'Shell': { color: '#89E051', textColor: '#000000', abbrev: 'SH' },
    'Ruby': { color: '#CC342D', textColor: '#FFFFFF', abbrev: 'RB' },
    'PHP': { color: '#777BB4', textColor: '#FFFFFF', abbrev: 'PH' },
    'Swift': { color: '#FA7343', textColor: '#FFFFFF', abbrev: 'SW' },
    'Kotlin': { color: '#A97BFF', textColor: '#FFFFFF', abbrev: 'KT' },
    'Dart': { color: '#00B4AB', textColor: '#FFFFFF', abbrev: 'DT' },
    'Scala': { color: '#DC322F', textColor: '#FFFFFF', abbrev: 'SC' },
    'R': { color: '#276DC3', textColor: '#FFFFFF', abbrev: 'R' },
    'SCSS': { color: '#CC6699', textColor: '#FFFFFF', abbrev: 'SC' }
};

const FALLBACK_COLOR = '#60a5fa'; // blue-400

const INNER_RADIUS = 110;
const OUTER_RADIUS = 190;

const deviconMap = {
    "JavaScript": "javascript",
    "TypeScript": "typescript",
    "Python": "python",
    "React": "react",
    "Vue": "vuejs",
    "Node.js": "nodejs",
    "HTML": "html5",
    "CSS": "css3",
    "Tailwind": "tailwindcss",
    "Go": "go",
    "Rust": "rust",
    "Java": "java",
    "C++": "cplusplus",
    "C": "c",
    "C#": "csharp",
    "Docker": "docker",
    "Git": "git",
    "Ruby": "ruby",
    "PHP": "php",
    "Swift": "swift",
    "Kotlin": "kotlin",
    "Dart": "dart",
    "Scala": "scala",
    "R": "r",
    "Shell": "bash",
    "SCSS": "sass",
    "Jupyter Notebook": "jupyter",
    "Svelte": "svelte",
    "Electron": "electron",
    "PyTorch": "pytorch",
};

function getSkillConfig(name) {
    const base = SKILL_COLORS[name] || {};
    const color = base.color || FALLBACK_COLOR;
    const textColor = base.textColor || '#FFFFFF';
    let abbrev = base.abbrev;

    if (!abbrev && typeof name === 'string' && name.length >= 2) {
        abbrev = name.slice(0, 2).toUpperCase();
    } else if (!abbrev) {
        abbrev = '??';
    }

    return { color, textColor, abbrev };
}

function OrbitingSkills({ skills }) {
    const [time, setTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const lastTimeRef = useRef(null);
    const frameRef = useRef(null);

    const cappedSkills = (skills || []).slice(0, 8);
    const total = cappedSkills.length;

    const innerCount = Math.min(3, total);
    const outerCount = total > innerCount ? total - innerCount : 0;

    const items = cappedSkills.map((name, index) => {
        const isInner = index < innerCount;
        const ringIndex = isInner ? index : index - innerCount;
        const countInRing = isInner ? innerCount : outerCount;
        const radius = isInner ? INNER_RADIUS : OUTER_RADIUS;
        const speed = isInner ? 0.5 : -0.35;
        const phaseStep = countInRing > 0 ? (2 * Math.PI) / countInRing : 0;
        const phaseShift = phaseStep * ringIndex;
        const size = isInner ? 48 : 52;
        const config = getSkillConfig(name);

        const slug = deviconMap[name] || null;

        return {
            name,
            isInner,
            radius,
            speed,
            phaseShift,
            size,
            slug,
            ...config,
            index
        };
    });

    useEffect(() => {
        if (isPaused || total === 0) {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
            lastTimeRef.current = null;
            return;
        }

        const step = (timestamp) => {
            if (lastTimeRef.current == null) {
                lastTimeRef.current = timestamp;
            }
            const delta = (timestamp - lastTimeRef.current) / 1000;
            lastTimeRef.current = timestamp;

            setTime(prev => prev + delta);
            frameRef.current = requestAnimationFrame(step);
        };

        frameRef.current = requestAnimationFrame(step);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
            lastTimeRef.current = null;
        };
    }, [isPaused, total]);

    return (
        <div className="w-full flex items-center justify-center overflow-hidden">
            <div
                className="relative w-[300px] h-[300px] md:w-[460px] md:h-[460px]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Orbit rings */}
                {total > 0 && (
                    <div>
                        {innerCount > 0 && (
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                                style={{
                                    width: INNER_RADIUS * 2,
                                    height: INNER_RADIUS * 2,
                                    border: '1px solid rgba(34,211,238,0.4)',
                                    boxShadow: '0 0 40px rgba(6,182,212,0.25), inset 0 0 40px rgba(6,182,212,0.1)',
                                    background:
                                        'radial-gradient(circle, transparent 40%, rgba(6,182,212,0.08) 70%, rgba(6,182,212,0.15) 100%)'
                                }}
                            />
                        )}

                        {outerCount > 0 && (
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                                style={{
                                    width: OUTER_RADIUS * 2,
                                    height: OUTER_RADIUS * 2,
                                    border: '1px solid rgba(168,85,247,0.4)',
                                    boxShadow: '0 0 60px rgba(147,51,234,0.3), inset 0 0 60px rgba(147,51,234,0.15)',
                                    background:
                                        'radial-gradient(circle, transparent 40%, rgba(147,51,234,0.08) 70%, rgba(147,51,234,0.18) 100%)'
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Central node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-18 h-18 md:w-[72px] md:h-[72px] rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 rounded-full blur-xl animate-pulse bg-cyan-500/30" />
                    <svg width="36" height="36" viewBox="0 0 36 36">
                        <defs>
                            <linearGradient id="orbiting-skills-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                        <polyline
                            points="10,11 6,18 10,25"
                            fill="none"
                            stroke="url(#orbiting-skills-gradient)"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <line
                            x1="15"
                            y1="11"
                            x2="21"
                            y2="25"
                            stroke="url(#orbiting-skills-gradient)"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                        />
                        <polyline
                            points="26,11 30,18 26,25"
                            fill="none"
                            stroke="url(#orbiting-skills-gradient)"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Skill badges */}
                {items.map(item => {
                    const angle = time * item.speed + item.phaseShift;
                    const x = Math.cos(angle) * item.radius;
                    const y = Math.sin(angle) * item.radius;

                    const baseTranslate = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
                    const isHovered = hoveredIndex === item.index;

                    const transform = isHovered
                        ? `${baseTranslate} scale(1.2)`
                        : baseTranslate;

                    const boxShadow = isHovered
                        ? `0 0 30px ${item.color}40, 0 0 60px ${item.color}20`
                        : 'none';

                    const sizeClass = item.isInner ? 'w-12 h-12' : 'w-13 h-13';

                    return (
                        <div
                            key={item.index}
                            className={`absolute top-1/2 left-1/2 flex items-center justify-center rounded-full bg-gray-800/90 backdrop-blur-sm cursor-pointer transition-all duration-200 shadow-lg border border-white/10 ${sizeClass}`}
                            style={{
                                transform,
                                boxShadow
                            }}
                            onMouseEnter={() => {
                                setHoveredIndex(item.index);
                                setIsPaused(true);
                            }}
                            onMouseLeave={() => {
                                setHoveredIndex(null);
                                setIsPaused(false);
                            }}
                        >
                            <div className="flex items-center justify-center relative w-full h-full">
                                {item.slug ? (
                                    <img
                                        src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${item.slug}/${item.slug}-original.svg`}
                                        alt={item.name}
                                        className="w-full h-full object-contain p-1.5"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center relative">
                                        <div
                                            className="w-3 h-3 rounded-full mr-1.5"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span
                                            className="text-[9px] font-bold"
                                            style={{ color: item.textColor }}
                                        >
                                            {item.abbrev}
                                        </span>
                                    </div>
                                )}

                                {isHovered && (
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900/95 rounded text-xs text-white whitespace-nowrap pointer-events-none">
                                        {item.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default OrbitingSkills;

