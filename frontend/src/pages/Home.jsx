import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Use production API URL if available, else fallback to empty string (Vite proxy)
const apiUrl = import.meta.env.VITE_API_URL || '';

/**
 * Home page — the landing page for the AI GitHub Analyzer.
 * Contains a hero section with roast mode toggle, live counter,
 * "how it works" steps, and a sample preview.
 */
function Home() {
    const [username, setUsername] = useState('');
    const [isRoastMode, setIsRoastMode] = useState(false);
    const [totalAnalyzed, setTotalAnalyzed] = useState(0);
    const [displayAnalyzed, setDisplayAnalyzed] = useState(0);
    const [totalVisitors, setTotalVisitors] = useState(0);
    const [displayVisitors, setDisplayVisitors] = useState(0);
    const navigate = useNavigate();

    /**
     * Fetches the total analysis count and visitor count from the backend on mount,
     * then kicks off a count-up animation from 0 to the real values.
     */
    useEffect(() => {
        fetch(`${apiUrl}/api/stats`)
            .then(r => r.json())
            .then(data => {
                if (data.total_analyzed) {
                    setTotalAnalyzed(data.total_analyzed);
                }
                if (data.total_visitors) {
                    setTotalVisitors(data.total_visitors);
                }
            })
            .catch(() => {
                // Silently fail — counter is cosmetic, not critical
            });
    }, []);

    // Animate the counters from 0 over ~1.5 seconds
    useEffect(() => {
        if (totalAnalyzed === 0 && totalVisitors === 0) return;

        const duration = 1500;
        const steps = 40;
        const incrementAnalyzed = totalAnalyzed / steps;
        const incrementVisitors = totalVisitors / steps;
        let currentAnalyzed = 0;
        let currentVisitors = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            currentAnalyzed = Math.min(Math.round(incrementAnalyzed * step), totalAnalyzed);
            currentVisitors = Math.min(Math.round(incrementVisitors * step), totalVisitors);

            setDisplayAnalyzed(currentAnalyzed);
            setDisplayVisitors(currentVisitors);

            if (step >= steps) clearInterval(timer);
        }, duration / steps);

        return () => clearInterval(timer);
    }, [totalAnalyzed, totalVisitors]);

    /**
     * Navigates the user to the results page when the form is submitted.
     * Appends ?mode=roast if roast mode is enabled.
     */
    const handleAnalyze = (e) => {
        e.preventDefault();
        if (username.trim()) {
            const path = `/results/${username.trim()}${isRoastMode ? '?mode=roast' : ''}`;
            navigate(path);
        }
    };

    /**
     * Registers the CSS Houdini PaintWorklet and implements mouse tracking
     * for the ring particles background effect.
     */
    useEffect(() => {
        // Register the Houdini PaintWorklet
        if ('paintWorklet' in CSS) {
            // Guard to prevent multiple registrations
            if (!window.hasOwnProperty('ringParticlesRegistered')) {
                CSS.paintWorklet.addModule(
                    'https://unpkg.com/css-houdini-ringparticles/dist/ringparticles.js'
                );
                window.ringParticlesRegistered = true;
            }

            let isInteractive = false;
            const $welcome = document.querySelector('#welcome');
            if (!$welcome) return;

            const onPointerMove = (e) => {
                if (!isInteractive) {
                    $welcome.classList.add('interactive');
                    isInteractive = true;
                }
                $welcome.style.setProperty('--ring-x', (e.clientX / window.innerWidth) * 100);
                $welcome.style.setProperty('--ring-y', (e.clientY / window.innerHeight) * 100);
                $welcome.style.setProperty('--ring-interactive', 1);
            };

            const onPointerLeave = () => {
                $welcome.classList.remove('interactive');
                isInteractive = false;
                $welcome.style.setProperty('--ring-x', 50);
                $welcome.style.setProperty('--ring-y', 50);
                $welcome.style.setProperty('--ring-interactive', 0);
            };

            $welcome.addEventListener('pointermove', onPointerMove);
            $welcome.addEventListener('pointerleave', onPointerLeave);

            return () => {
                $welcome.removeEventListener('pointermove', onPointerMove);
                $welcome.removeEventListener('pointerleave', onPointerLeave);
            };
        }
    }, []);

    return (
        <div className="relative min-h-screen bg-[#0a0a0f] text-white">
            <div className="relative z-10">
                {/* ===== HERO SECTION — background scoped here so sections below are not covered */}
                <section id="welcome" className="relative min-h-screen overflow-hidden w-full flex flex-col items-center justify-center text-center px-6 cursor-crosshair">
                    {/* Gradient background orbs for visual depth — purely decorative */}
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none z-0" />
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none z-0" />

                    <div className="relative z-10 text-center w-full max-w-4xl mx-auto">
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] text-center bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent tracking-tight">
                            See What Your Code Says
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                About You.
                            </span>
                        </h1>

                        <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-xl mx-auto text-center leading-relaxed">
                        Enter any GitHub username to get your tech stack analysis, career role fit across 50+ roles, and GitHub stats dashboard.
                    </p>

                    {/* Live counters — animates from 0 on page load */}
                    {(totalAnalyzed > 0 || totalVisitors > 0) && (
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm font-medium tracking-wide">
                            {totalVisitors > 0 && (
                                <p className="text-gray-400">
                                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block mr-1.5" />
                                    {displayVisitors.toLocaleString()} developers visited
                                </p>
                            )}
                            {totalAnalyzed > 0 && (
                                <p className="text-gray-500">
                                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block mr-1.5" />
                                    {displayAnalyzed.toLocaleString()} profiles analyzed
                                </p>
                            )}
                        </div>
                    )}

                    {/* Search form */}
                    <form onSubmit={handleAnalyze} className="mt-10 max-w-xl w-full mx-auto group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
                        <div className="relative flex items-center gap-2 bg-[#0d0d12]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-500 shadow-2xl">
                            <div className="pl-4 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                                </svg>
                            </div>
                            <input
                                id="github-username-input"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter GitHub username..."
                                className="bg-transparent flex-1 px-2 py-3 text-base md:text-lg text-white placeholder-gray-500 outline-none"
                            />
                            <button
                                id="analyze-button"
                                type="submit"
                                className="rounded-xl px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] cursor-pointer whitespace-nowrap active:scale-95"
                            >
                                Analyze →
                            </button>
                        </div>
                    </form>

                    {/* Roast Mode toggle */}
                    <div className="mt-5 flex items-center justify-center gap-3">
                        <span className={`text-sm transition-colors ${!isRoastMode ? 'text-gray-200 font-medium' : 'text-gray-600'}`}>Normal</span>
                        <button
                            type="button"
                            onClick={() => setIsRoastMode(!isRoastMode)}
                            className={`relative w-16 h-8 rounded-full border transition-colors duration-300 cursor-pointer ${isRoastMode ? 'bg-orange-500/90 border-orange-400' : 'bg-white/10 border-white/20'
                                }`}
                            aria-label="Toggle roast mode"
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-white shadow-md transition-transform duration-300 ${isRoastMode ? 'translate-x-8' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <span className={`text-sm transition-colors flex items-center gap-1 ${isRoastMode ? 'text-orange-400 font-semibold' : 'text-gray-600'}`}>
                            <span>🔥</span>
                            <span>Roast Me</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        How It Works
                    </h2>

                    <div className="relative">
                        <div className="hidden md:block absolute inset-x-8 top-1/2 -translate-y-1/2 border-t border-dashed border-white/10 pointer-events-none" />
                        <div className="grid md:grid-cols-3 gap-8 relative">
                        {[
                            {
                                step: '01',
                                icon: '🔍',
                                title: 'Enter Your Username',
                                desc: 'Just type your GitHub username. No sign-in, no permissions, no OAuth required.',
                            },
                            {
                                step: '02',
                                icon: '🤖',
                                title: 'AI Reads Your Code',
                                desc: 'Groq AI analyzes your repos, READMEs, languages, and project structures.',
                            },
                            {
                                step: '03',
                                icon: '📊',
                                title: 'Get Your Report',
                                desc: 'Receive your tech stack analysis, career match scores, and GitHub stats — shareable in one click.',
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="group relative p-10 rounded-[2rem] border border-white/5 bg-[#0f0f15] hover:bg-[#15151e] hover:-translate-y-2 hover:border-white/10 transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    <span className="text-8xl font-black italic">{item.step}</span>
                                </div>
                                <span className="text-xs font-mono tracking-widest text-blue-400 mb-6 block uppercase">{item.step} — Process</span>
                                <span className="text-5xl block mb-6 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{item.icon}</span>
                                <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm md:text-base">{item.desc}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SAMPLE PREVIEW ===== */}
            {/* Show realistic fake data so visitors understand the output before trying */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        What You'll Get
                    </h2>
                    <p className="text-gray-400 text-center mb-16 text-lg">A sneak peek at your personalized analysis report.</p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Stack Analysis Preview */}
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['Python', 'React', 'TypeScript', 'FastAPI', 'Docker'].map((tech) => {
                                    const styles = {
                                        Python: { bg: '#FFD43B', color: '#000000' },
                                        React: { bg: '#61DAFB', color: '#0B1120' },
                                        TypeScript: { bg: '#3178C6', color: '#FFFFFF' },
                                        FastAPI: { bg: '#059669', color: '#ECFDF5' },
                                        Docker: { bg: '#2496ED', color: '#E0F2FE' }
                                    }[tech] || { bg: '#1f2937', color: '#E5E7EB' };
                                    return (
                                        <span
                                            key={tech}
                                            className="px-3 py-1 rounded-full text-sm border border-white/20"
                                            style={{ backgroundColor: styles.bg, color: styles.color }}
                                        >
                                            {tech}
                                        </span>
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['Machine Learning', 'Web Dev'].map((domain) => (
                                    <span key={domain} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-sm border border-purple-500/30">
                                        {domain}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Role Fit Preview */}
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Role Fit</h3>
                            <div className="space-y-3">
                                {[
                                    { role: 'ML Engineer', score: 84 },
                                    { role: 'Backend Dev', score: 61 },
                                    { role: 'Full Stack', score: 48 },
                                ].map((item) => (
                                    <div key={item.role}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-300">{item.role}</span>
                                            <span className="text-gray-400">{item.score}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${item.score}%` }}
                                                aria-hidden="true"
                                                aria-label={`${item.role} ${item.score}%`}
                                                role="presentation"
                                                data-role={item.role}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Career Match Preview */}
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Career Match</h3>
                            <div className="space-y-3">
                                {[
                                    { role: 'Full Stack Dev', score: 92, color: 'bg-blue-500' },
                                    { role: 'ML Engineer', score: 84, color: 'bg-violet-500' },
                                    { role: 'Cloud Engineer', score: 71, color: 'bg-cyan-500' },
                                ].map((item) => (
                                    <div key={item.role}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-300">{item.role}</span>
                                            <span className="text-gray-400">{item.score}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${item.score}%`,
                                                    backgroundImage:
                                                        item.color === 'bg-blue-500'
                                                            ? 'linear-gradient(to right, #3b82f6, #22d3ee)'
                                                            : item.color === 'bg-violet-500'
                                                            ? 'linear-gradient(to right, #8b5cf6, #ec4899)'
                                                            : 'linear-gradient(to right, #06b6d4, #22c55e)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-8 px-4 border-t border-white/5 text-center text-gray-500 text-sm">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <span className="flex items-center gap-2">
                        <a href="https://fastapi.tiangolo.com" target="_blank" rel="noopener noreferrer" className="border border-white/10 rounded px-2 py-0.5 text-xs hover:border-white/30 transition-colors cursor-pointer">
                            FastAPI
                        </a>
                        <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="border border-white/10 rounded px-2 py-0.5 text-xs hover:border-white/30 transition-colors cursor-pointer">
                            Groq AI
                        </a>
                        <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="border border-white/10 rounded px-2 py-0.5 text-xs hover:border-white/30 transition-colors cursor-pointer">
                            React
                        </a>
                    </span>
                    <a
                        href="https://github.com/danishansari-dev/ai-github-analyzer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs"
                    >
                        <span>View on GitHub</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.088 3.292 9.395 7.868 10.918.575.106.786-.25.786-.556 0-.274-.01-1.002-.016-1.967-3.199.696-3.874-1.542-3.874-1.542-.523-1.328-1.278-1.681-1.278-1.681-1.044-.714.079-.699.079-.699 1.155.081 1.763 1.187 1.763 1.187 1.027 1.761 2.695 1.253 3.352.958.104-.744.402-1.253.73-1.541-2.553-.29-5.236-1.276-5.236-5.68 0-1.255.45-2.281 1.187-3.086-.119-.291-.515-1.462.112-3.049 0 0 .967-.31 3.17 1.18a10.98 10.98 0 0 1 2.886-.388c.979.005 1.966.132 2.886.388 2.201-1.49 3.166-1.18 3.166-1.18.63 1.587.235 2.758.116 3.049.74.805 1.186 1.831 1.186 3.086 0 4.417-2.688 5.386-5.252 5.67.414.357.781 1.066.781 2.148 0 1.551-.014 2.801-.014 3.183 0 .309.207.668.792.554C20.213 21.39 23.5 17.084 23.5 12 23.5 5.648 18.352.5 12 .5z" />
                        </svg>
                    </a>
                </div>
            </footer>
            </div>
        </div>
    );
}

export default Home;
