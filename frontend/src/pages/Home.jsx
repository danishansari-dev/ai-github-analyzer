import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingParticlesBackground from '../components/FloatingParticlesBackground';

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

    return (
        <div className="relative min-h-screen bg-[#0a0a0f] text-white">
            {/* Interactive Background */}
            <FloatingParticlesBackground 
                particleCount={70}
                particleColor="#60a5fa"
                mouseGravity="repel"
                glowIntensity={8}
                backgroundColor="transparent"
            />

            <div className="relative z-10">
                {/* ===== HERO SECTION ===== */}
                <section className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden">
                {/* Gradient background orbs for visual depth — purely decorative */}
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]" />

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Powered by Groq AI
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        Analyze Your GitHub.
                        <br />
                        Impress Every Recruiter.
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Enter any GitHub username to get your tech stack analysis, career role fit across 50+ roles, and GitHub stats dashboard.
                    </p>

                    {/* Live counters — animates from 0 on page load */}
                    {(totalAnalyzed > 0 || totalVisitors > 0) && (
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm font-medium tracking-wide">
                            {totalVisitors > 0 && (
                                <p className="text-gray-400">
                                    👥 {displayVisitors.toLocaleString()} developers visited
                                </p>
                            )}
                            {totalAnalyzed > 0 && (
                                <p className="text-gray-500">
                                    🔍 {displayAnalyzed.toLocaleString()} profiles analyzed
                                </p>
                            )}
                        </div>
                    )}

                    {/* Search form */}
                    <form onSubmit={handleAnalyze} className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
                        <input
                            id="github-username-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter GitHub username..."
                            className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        />
                        <button
                            id="analyze-button"
                            type="submit"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer whitespace-nowrap"
                        >
                            Analyze →
                        </button>
                    </form>

                    {/* Roast Mode toggle */}
                    <div className="mt-5 flex items-center justify-center gap-3">
                        <span className={`text-sm transition-colors ${!isRoastMode ? 'text-gray-300' : 'text-gray-600'}`}>Normal</span>
                        <button
                            type="button"
                            onClick={() => setIsRoastMode(!isRoastMode)}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer ${isRoastMode ? 'bg-orange-500' : 'bg-white/10'
                                }`}
                            aria-label="Toggle roast mode"
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isRoastMode ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <span className={`text-sm transition-colors ${isRoastMode ? 'text-orange-400' : 'text-gray-600'}`}>🔥 Roast Me</span>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
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
                                className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
                            >
                                <span className="text-xs font-mono text-gray-600 mb-4 block">{item.step}</span>
                                <span className="text-4xl block mb-4">{item.icon}</span>
                                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
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
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['Python', 'React', 'TypeScript', 'FastAPI', 'Docker'].map((tech) => (
                                    <span key={tech} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['Machine Learning', 'Web Dev'].map((domain) => (
                                    <span key={domain} className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm border border-violet-500/20">
                                        {domain}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Role Fit Preview */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
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
                                        <div className="w-full h-2 rounded-full bg-white/5">
                                            <div
                                                className={`h-full rounded-full ${item.score > 70 ? 'bg-blue-500' : 'bg-gray-600'}`}
                                                style={{ width: `${item.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Career Match Preview */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
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
                                        <div className="w-full h-2 rounded-full bg-white/5">
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{ width: `${item.score}%` }}
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
                Built with FastAPI, Groq AI, and React.
            </footer>
            </div>
        </div>
    );
}

export default Home;
