import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

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

/**
 * Category mapping — used to group skills in the full Tech Stack panel.
 * Uncategorized skills fall into "Tools & Other".
 */
const TECH_CATEGORIES = {
  'Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go',
    'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R',
    'MATLAB', 'Shell', 'Bash', 'PowerShell', 'Lua', 'Perl', 'Haskell',
    'Elixir', 'Clojure', 'Erlang', 'OCaml', 'F#', 'Groovy', 'Zig',
    'CoffeeScript', 'WebAssembly', 'Solidity'
  ],
  'Frontend': [
    'HTML', 'CSS', 'SCSS', 'Sass', 'Less', 'React', 'Vue', 'Angular',
    'Svelte', 'Next.js', 'Nuxt.js', 'Tailwind', 'Vite', 'Electron'
  ],
  'Backend & Runtime': [
    'Node.js', 'NodeJs', 'Express', 'Django', 'Flask', 'FastAPI',
    'Spring', 'Laravel', 'Rails', 'GraphQL'
  ],
  'Data Science & ML': [
    'PyTorch', 'TensorFlow', 'OpenCV', 'Pandas', 'NumPy', 'Jupyter Notebook',
    'Scikit-learn', 'Matplotlib', 'Plotly', 'Keras'
  ],
  'Cloud & DevOps': [
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Linux', 'Ubuntu',
    'Git', 'Firebase', 'Ansible', 'Jenkins'
  ],
  'Databases': [
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Cassandra'
  ],
  'Tools & Other': [
    'Unity', 'Godot', 'GraphQL', 'WebAssembly'
  ]
};

/**
 * Groups the flat skills array into named categories for the panel.
 * @param {string[]} skills - Flat list of skill names
 * @returns {Record<string, string[]>} Categorized skills
 */
function categorizeSkills(skills) {
  const categorized = {};
  const usedSkills = new Set();

  Object.entries(TECH_CATEGORIES).forEach(([category, categorySkills]) => {
    const matches = skills.filter(s =>
      categorySkills.some(cs => cs.toLowerCase() === s.toLowerCase())
    );
    if (matches.length > 0) {
      categorized[category] = matches;
      matches.forEach(s => usedSkills.add(s));
    }
  });

  // Put uncategorized skills in "Tools & Other"
  const uncategorized = skills.filter(s => !usedSkills.has(s));
  if (uncategorized.length > 0) {
    categorized['Tools & Other'] = [
      ...(categorized['Tools & Other'] || []),
      ...uncategorized
    ];
  }

  return categorized;
}

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

/**
 * Full-screen slide-in panel showing ALL skills grouped by category.
 * Rendered via React Portal so it escapes any overflow-hidden ancestors.
 * @param {{ skills: string[], onClose: () => void }} props
 */
function TechStackPanel({ skills, onClose }) {
  const categorized = categorizeSkills(skills);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0d0d14] border-l border-white/10 z-50 flex flex-col shadow-2xl overflow-hidden"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="panel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <polyline points="10,11 6,18 10,25" stroke="url(#panel-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <line x1="15" y1="11" x2="21" y2="25" stroke="url(#panel-grad)" strokeWidth="2.5" strokeLinecap="round"/>
                <polyline points="26,11 30,18 26,25" stroke="url(#panel-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">Tech Stack</h2>
              <p className="text-white/40 text-xs mt-0.5">{skills.length} technologies detected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {Object.entries(categorized).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-3">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => {
                  const slug = deviconMap[skill] || null;
                  // Resolve a brand colour for each pill
                  const pillColor = (() => {
                    const SKILL_COLORS_LOCAL = {
                      'JavaScript': '#F7DF1E', 'TypeScript': '#3178C6',
                      'Python': '#3776AB', 'React': '#61DAFB',
                      'Java': '#ED8B00', 'C++': '#00599C',
                      'Go': '#00ADD8', 'Rust': '#CE422B',
                      'Docker': '#2496ED', 'Git': '#F05032',
                      'Node.js': '#339933', 'HTML': '#E34F26',
                      'CSS': '#1572B6', 'Tailwind': '#06B6D4',
                      'PyTorch': '#EE4C2C', 'TensorFlow': '#FF6F00',
                      'Vue': '#42B883', 'Swift': '#FA7343',
                      'Kotlin': '#A97BFF', 'Ruby': '#CC342D',
                      'PHP': '#777BB4', 'AWS': '#FF9900',
                      'Firebase': '#FFCA28', 'MongoDB': '#47A248',
                      'PostgreSQL': '#4169E1', 'MySQL': '#4479A1',
                      'Redis': '#DC382D', 'Kubernetes': '#326CE5',
                    };
                    return SKILL_COLORS_LOCAL[skill] || '#60a5fa';
                  })();

                  return (
                    <div
                      key={skill}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider cursor-default select-none transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: pillColor + '18',
                        borderColor: pillColor + '50',
                        color: pillColor,
                      }}
                    >
                      {slug ? (
                        <img
                          src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`}
                          alt={skill}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            e.target.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-plain.svg`;
                            e.target.onerror = () => { e.target.style.display = 'none'; };
                          }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pillColor + '40' }} />
                      )}
                      <span>{skill}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function OrbitingSkills({ skills }) {
    const [time, setTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [showPanel, setShowPanel] = useState(false);
    const lastTimeRef = useRef(null);
    const frameRef = useRef(null);
    const containerRef = useRef(null);

    // Reactive size tracking — ResizeObserver ensures re-render with real pixel values
    const [liveSize, setLiveSize] = useState(460);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const measure = () => {
            const rect = el.getBoundingClientRect();
            const s = Math.min(rect.width, rect.height);
            if (s > 50) setLiveSize(s);
        };

        measure();
        // Delayed re-measure to catch layout shifts after initial paint
        const t = setTimeout(measure, 100);
        const ro = new ResizeObserver(measure);
        ro.observe(el);

        return () => {
            clearTimeout(t);
            ro.disconnect();
        };
    }, []);

    // Core Math (Calculated from reactive liveSize)
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

    // Close the tech-stack panel when ESC is pressed
    useEffect(() => {
        if (!showPanel) return;
        const onKey = (e) => { if (e.key === 'Escape') setShowPanel(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showPanel]);

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
                {/* Glowing orbit rings — cyan inner, purple outer */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Inner ring (cyan) */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: INNER_R * 2,
                            height: INNER_R * 2,
                            top: CENTER - INNER_R,
                            left: CENTER - INNER_R,
                        }}
                    >
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, transparent 30%, rgba(6,182,212,0.15) 70%, rgba(6,182,212,0.3) 100%)',
                                boxShadow: '0 0 60px rgba(6,182,212,0.3), inset 0 0 60px rgba(6,182,212,0.15)',
                                animation: 'pulse 4s ease-in-out infinite',
                            }}
                        />
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                border: '1px solid rgba(6,182,212,0.3)',
                                boxShadow: 'inset 0 0 20px rgba(6,182,212,0.15)',
                            }}
                        />
                    </div>
                    {/* Outer ring (purple) */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: OUTER_R * 2,
                            height: OUTER_R * 2,
                            top: CENTER - OUTER_R,
                            left: CENTER - OUTER_R,
                        }}
                    >
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, transparent 30%, rgba(147,51,234,0.15) 70%, rgba(147,51,234,0.3) 100%)',
                                boxShadow: '0 0 60px rgba(147,51,234,0.3), inset 0 0 60px rgba(147,51,234,0.15)',
                                animation: 'pulse 4s ease-in-out infinite',
                                animationDelay: '1.5s',
                            }}
                        />
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                border: '1px solid rgba(147,51,234,0.3)',
                                boxShadow: 'inset 0 0 20px rgba(147,51,234,0.15)',
                            }}
                        />
                    </div>
                </div>

                {/* Central node — click to open full Tech Stack panel */}
                <div
                    onClick={() => setShowPanel(true)}
                    className="rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative shadow-2xl z-20 cursor-pointer hover:scale-110 transition-transform duration-300 group"
                    style={{
                        top: CENTER - 32,
                        left: CENTER - 32,
                        width: 64,
                        height: 64,
                        position: 'absolute',
                    }}
                    title="View full tech stack"
                >
                    <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl animate-pulse" />
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                    {/* Hover ring hint */}
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/0 group-hover:border-cyan-400/50 transition-all duration-300" />
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

            {/* Tech Stack panel — rendered via portal to escape overflow-hidden */}
            {showPanel && createPortal(
                <TechStackPanel
                    skills={skills || []}
                    onClose={() => setShowPanel(false)}
                />,
                document.body
            )}
        </div>
    );
}

export default OrbitingSkills;


