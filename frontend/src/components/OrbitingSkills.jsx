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

    // Get live dimensions directly inside render for stability
    const rect = containerRef.current?.getBoundingClientRect();
    const liveSize = rect ? Math.min(rect.width, rect.height) : 460;
    
    // Core Math (Calculated every frame/render)
    const CENTER = liveSize / 2;
    const INNER_R = liveSize * 0.24;
    const OUTER_R = liveSize * 0.40;

    // Use two tiers as requested for stability in the core prompt
    const innerSkills = (skills || []).slice(0, 4);
    const outerSkills = (skills || []).slice(4, 12);
    const total = innerSkills.length + outerSkills.length;

    useEffect(() => {
        if (isPaused || total === 0) {
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
    }, [isPaused, total]);

    // Compute badges based on live measurements
    const badges = useMemo(() => {
        const all = [];
        innerSkills.forEach((name, i) => {
            all.push({
                name,
                radius: INNER_R,
                speed: 0.4,
                phaseShift: (i / (innerSkills.length || 1)) * Math.PI * 2,
                size: Math.max(38, liveSize * 0.08),
                ...getSkillConfig(name),
                slug: deviconMap[name] || null,
                index: all.length
            });
        });
        outerSkills.forEach((name, i) => {
            all.push({
                name,
                radius: OUTER_R,
                speed: 0.18,
                phaseShift: (i / (outerSkills.length || 1)) * Math.PI * 2,
                size: Math.max(44, liveSize * 0.1),
                ...getSkillConfig(name),
                slug: deviconMap[name] || null,
                index: all.length
            });
        });
        return all;
    }, [innerSkills, outerSkills, INNER_R, OUTER_R, liveSize]);

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '460px', position: 'relative', overflow: 'hidden' }}>
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: '460px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Orbit rings */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute rounded-full border border-white/5"
                        style={{
                            width: INNER_R * 2,
                            height: INNER_R * 2,
                            top: CENTER - INNER_R,
                            left: CENTER - INNER_R,
                        }}
                    />
                    <div
                        className="absolute rounded-full border border-white/5"
                        style={{
                            width: OUTER_R * 2,
                            height: OUTER_R * 2,
                            top: CENTER - OUTER_R,
                            left: CENTER - OUTER_R,
                        }}
                    />
                </div>

                {/* Central node - explicit positioning */}
                <div 
                    className="rounded-full bg-slate-900/50 flex items-center justify-center relative shadow-2xl border border-white/10 z-20"
                    style={{
                        top: CENTER - 32,
                        left: CENTER - 32,
                        width: 64,
                        height: 64,
                        position: 'absolute',
                    }}
                >
                    <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/10 animate-pulse" />
                    <svg width="24" height="24" viewBox="0 0 36 36" className="relative z-10 transition-transform duration-500">
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
                {badges.map(item => {
                    const angle = time * item.speed + item.phaseShift;
                    const x = CENTER + Math.cos(angle) * item.radius;
                    const y = CENTER + Math.sin(angle) * item.radius;
                    const isHovered = hoveredIndex === item.index;

                    return (
                        <button
                            type="button"
                            key={item.index}
                            className="absolute flex items-center justify-center rounded-full bg-gray-950/90 backdrop-blur-md cursor-pointer transition-all duration-300 border border-white/5 z-10"
                            style={{
                                width: `${item.size}px`,
                                height: `${item.size}px`,
                                top: y - (item.size / 2),
                                left: x - (item.size / 2),
                                transform: `scale(${isHovered ? 1.3 : 1})`,
                                boxShadow: isHovered ? `0 0 30px ${item.color}50` : '0 4px 12px rgba(0,0,0,0.5)',
                                borderColor: isHovered ? `${item.color}80` : undefined
                            }}
                            onMouseEnter={() => setHoveredIndex(item.index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="w-full h-full p-2 flex items-center justify-center">
                                {item.slug ? (
                                    <DevIcon slug={item.slug} name={item.name} color={item.color} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full mb-0.5" style={{ backgroundColor: item.color }} />
                                        <span className="text-[7px] font-black uppercase tracking-tighter" style={{ color: item.textColor }}>
                                            {item.abbrev}
                                        </span>
                                    </div>
                                )}
                                {isHovered && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/95 border border-white/10 rounded-md text-[10px] font-bold text-white whitespace-nowrap shadow-2xl pointer-events-none">
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


