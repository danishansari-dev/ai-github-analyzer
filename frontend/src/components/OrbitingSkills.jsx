import { useState, useEffect, useRef, useMemo } from 'react';

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



const deviconMap = {
  "JavaScript": "javascript",
  "TypeScript": "typescript",
  "Python": "python",
  "Java": "java",
  "C": "c",
  "C++": "cplusplus",
  "C#": "csharp",
  "Go": "go",
  "Rust": "rust",
  "Ruby": "ruby",
  "PHP": "php",
  "Swift": "swift",
  "Kotlin": "kotlin",
  "Dart": "dart",
  "Scala": "scala",
  "R": "r",
  "MATLAB": "matlab",
  "Shell": "bash",
  "Bash": "bash",
  "PowerShell": "powershell",
  "HTML": "html5",
  "CSS": "css3",
  "SCSS": "sass",
  "Sass": "sass",
  "Less": "less",
  "React": "react",
  "Vue": "vuejs",
  "Angular": "angularjs",
  "Svelte": "svelte",
  "Node.js": "nodejs",
  "NodeJs": "nodejs",
  "Express": "express",
  "Django": "django",
  "Flask": "flask",
  "FastAPI": "fastapi",
  "Spring": "spring",
  "Laravel": "laravel",
  "Rails": "rails",
  "Docker": "docker",
  "Kubernetes": "kubernetes",
  "Git": "git",
  "GraphQL": "graphql",
  "MongoDB": "mongodb",
  "PostgreSQL": "postgresql",
  "MySQL": "mysql",
  "Redis": "redis",
  "Firebase": "firebase",
  "AWS": "amazonwebservices",
  "GCP": "googlecloud",
  "Azure": "azure",
  "Linux": "linux",
  "Ubuntu": "ubuntu",
  "Electron": "electron",
  "Jupyter Notebook": "jupyter",
  "Lua": "lua",
  "Perl": "perl",
  "Haskell": "haskell",
  "Elixir": "elixir",
  "Clojure": "clojure",
  "Erlang": "erlang",
  "OCaml": "ocaml",
  "F#": "fsharp",
  "Vite": "vitejs",
  "Tailwind": "tailwindcss",
  "Next.js": "nextjs",
  "Nuxt.js": "nuxtjs",
  "PyTorch": "pytorch",
  "TensorFlow": "tensorflow",
  "OpenCV": "opencv",
  "Pandas": "pandas",
  "NumPy": "numpy",
  "Unity": "unity",
  "Godot": "godot",
  "Solidity": "solidity",
  "WebAssembly": "wasm",
  "Zig": "zig",
  "CoffeeScript": "coffeescript",
  "Groovy": "groovy",
};

function DevIcon({ slug, name, color }) {
  const [src, setSrc] = useState(
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`
  );
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const fallbacks = [
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`,
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-plain.svg`,
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original-wordmark.svg`,
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-plain-wordmark.svg`,
  ];

  const handleError = () => {
    const next = fallbackIndex + 1;
    if (next < fallbacks.length) {
      setFallbackIndex(next);
      setSrc(fallbacks[next]);
    } else {
      setSrc(null); // triggers text fallback
    }
  };

  if (!src) {
    return (
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-[9px] font-bold text-white"
        style={{ backgroundColor: color + '33', border: `1px solid ${color}66` }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-contain p-1"
      onError={handleError}
    />
  );
}

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
    const containerRef = useRef(null);
    
    const [dimensions, setDimensions] = useState({ width: 460, height: 460 });
    const [dimensionsReady, setDimensionsReady] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                setDimensions({ width, height });
                setDimensionsReady(true);
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const minSide = Math.min(dimensions.width, dimensions.height);
    
    // TIER RADII - Optimized for 3 layers without crowding
    const RADII = {
        INNER: minSide * 0.18,
        MID: minSide * 0.30,
        OUTER: minSide * 0.42
    };

    // TIER COUNTS: 3 + 7 + 10 = 20 skills total
    const innerSkills = (skills || []).slice(0, 3);
    const midSkills = (skills || []).slice(3, 10);
    const outerSkills = (skills || []).slice(10, 20);
    const total = innerSkills.length + midSkills.length + outerSkills.length;

    const items = useMemo(() => {
        if (!dimensionsReady) return [];
        
        const allItems = [];
        
        // Inner Orbit (3 items, fastest)
        innerSkills.forEach((name, index) => {
            allItems.push({
                name,
                radius: RADII.INNER,
                speed: 0.5,
                phaseShift: (index / (innerSkills.length || 1)) * Math.PI * 2,
                size: Math.max(34, minSide * 0.07),
                ...getSkillConfig(name),
                slug: deviconMap[name] || null,
                index: allItems.length
            });
        });

        // Middle Orbit (7 items, moderate)
        midSkills.forEach((name, index) => {
            allItems.push({
                name,
                radius: RADII.MID,
                speed: -0.25, // Counter-rotation for visual complexity
                phaseShift: (index / (midSkills.length || 1)) * Math.PI * 2,
                size: Math.max(38, minSide * 0.085),
                ...getSkillConfig(name),
                slug: deviconMap[name] || null,
                index: allItems.length
            });
        });

        // Outer Orbit (10 items, slowest)
        outerSkills.forEach((name, index) => {
            allItems.push({
                name,
                radius: RADII.OUTER,
                speed: 0.15,
                phaseShift: (index / (outerSkills.length || 1)) * Math.PI * 2,
                size: Math.max(42, minSide * 0.1),
                ...getSkillConfig(name),
                slug: deviconMap[name] || null,
                index: allItems.length
            });
        });

        return allItems;
    }, [innerSkills, midSkills, outerSkills, RADII.INNER, RADII.MID, RADII.OUTER, dimensionsReady, minSide]);

    useEffect(() => {
        if (isPaused || total === 0 || !dimensionsReady) {
            cancelAnimationFrame(frameRef.current);
            lastTimeRef.current = null;
            return;
        }

        const step = (timestamp) => {
            if (lastTimeRef.current == null) lastTimeRef.current = timestamp;
            const delta = (timestamp - lastTimeRef.current) / 1000;
            lastTimeRef.current = timestamp;
            setTime(prev => prev + delta);
            frameRef.current = requestAnimationFrame(step);
        };

        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
    }, [isPaused, total, dimensionsReady]);

    return (
        <div className="w-full h-full min-h-[460px] flex items-center justify-center relative overflow-hidden">
            <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Orbit rings */}
                {dimensionsReady && total > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                        {innerSkills.length > 0 && (
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.05)]"
                                style={{ width: RADII.INNER * 2, height: RADII.INNER * 2 }}
                            />
                        )}
                        {midSkills.length > 0 && (
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.05)]"
                                style={{ width: RADII.MID * 2, height: RADII.MID * 2 }}
                            />
                        )}
                        {outerSkills.length > 0 && (
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-500/10 shadow-[0_0_50px_rgba(236,72,153,0.05)]"
                                style={{ width: RADII.OUTER * 2, height: RADII.OUTER * 2 }}
                            />
                        )}
                    </div>
                )}

                {/* Central node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center relative shadow-[0_0_50px_rgba(6,182,212,0.15)] border border-white/10 z-20">
                    <div className="absolute inset-0 rounded-full blur-2xl animate-pulse bg-cyan-500/10" />
                    <svg width="28" height="28" viewBox="0 0 36 36" className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                        <defs>
                            <linearGradient id="orbiting-skills-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                        <polyline points="10,11 6,18 10,25" fill="none" stroke="url(#orbiting-skills-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="15" y1="11" x2="21" y2="25" stroke="url(#orbiting-skills-gradient)" strokeWidth="2.5" strokeLinecap="round" />
                        <polyline points="26,11 30,18 26,25" fill="none" stroke="url(#orbiting-skills-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Skill badges */}
                {items.map(item => {
                    const angle = time * item.speed + item.phaseShift;
                    const x = Math.cos(angle) * item.radius;
                    const y = Math.sin(angle) * item.radius;
                    const isHovered = hoveredIndex === item.index;
                    
                    return (
                        <button
                            type="button"
                            key={item.index}
                            className="absolute top-1/2 left-1/2 transition-shadow duration-300 z-10 group/item"
                            style={{
                                width: `${item.size}px`,
                                height: `${item.size}px`,
                                transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(${isHovered ? 1.3 : 1})`,
                                boxShadow: isHovered ? `0 0 40px ${item.color}66` : '0 4px 12px rgba(0,0,0,0.5)',
                            }}
                            onMouseEnter={() => setHoveredIndex(item.index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div 
                                className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 border border-white/5 transition-colors group-hover/item:border-white/20"
                                style={{ borderColor: isHovered ? `${item.color}80` : undefined }}
                            >
                                {item.slug ? (
                                    <DevIcon slug={item.slug} name={item.name} color={item.color} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full mb-0.5" style={{ backgroundColor: item.color }} />
                                        <span className="text-[7px] font-black tracking-tighter" style={{ color: item.textColor }}>{item.abbrev}</span>
                                    </div>
                                )}
                                
                                {isHovered && (
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black/90 border border-white/10 rounded-md text-[10px] font-bold text-white whitespace-nowrap pointer-events-none z-50 shadow-2xl animate-in fade-in zoom-in duration-150">
                                        {item.name}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default OrbitingSkills;


