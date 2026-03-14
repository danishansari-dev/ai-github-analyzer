import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import ProfileCard from '../components/ProfileCard';
import RoleScoreCard from '../components/RoleScoreCard';
import RepoShowcase from '../components/RepoShowcase';
import GitHubStats from '../components/GitHubStats';
import OrbitingSkills from '../components/OrbitingSkills';
import { GlowCard } from '../components/SpotlightCard';

// 90-second timeout so the loading screen never spins forever
const FETCH_TIMEOUT_MS = 90000;

// Use production API URL if available, else fallback to empty string (Vite proxy)
const apiUrl = import.meta.env.VITE_API_URL || '';

/**
 * Results page — Fetches analysis data from the backend for a given GitHub username
 * and renders the main result cards. Supports normal and roast modes, and includes
 * a shareable PNG card generator.
 */
function Results() {
    const { username: rawUsername } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const username = rawUsername.split('#')[0].trim();
    const mode = searchParams.get('mode') || 'normal';
    const isRoast = mode === 'roast';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const [toast, setToast] = useState(null);
    const [starRequired, setStarRequired] = useState(false);
    const [startTrigger, setStartTrigger] = useState(0);

    useEffect(() => {
        if (!localStorage.getItem('has_starred')) {
            setStarRequired(true);
            setLoading(false);
            return;
        }

        let isCancelled = false;

        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);
            setErrorCode(null);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            try {
                const url = `${apiUrl}/api/analyze/${encodeURIComponent(username)}${isRoast ? '?mode=roast' : ''}`;
                const response = await fetch(url, { signal: controller.signal });

                clearTimeout(timeoutId);
                if (isCancelled) return;

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const apiMessage = errorData?.detail || null;

                    // Store the status code so the error UI can adapt
                    if (response.status === 404 || response.status === 422) {
                        setErrorCode(404);
                        throw new Error(apiMessage || `We couldn't find GitHub user '@${username}'. Check the spelling and try again.`);
                    } else if (response.status === 429) {
                        setErrorCode(429);
                        throw new Error(apiMessage || 'GitHub API rate limit exceeded. Please try again in about an hour.');
                    } else {
                        setErrorCode(response.status);
                        throw new Error(apiMessage || `Server error ${response.status}: ${response.statusText}`);
                    }
                }

                const result = await response.json();
                if (!isCancelled) {
                    setData(result);
                }
            } catch (err) {
                clearTimeout(timeoutId);
                if (!isCancelled) {
                    if (err.name === 'AbortError') {
                        setErrorCode(0);
                        setError('Analysis is taking too long. Please try again.');
                    } else {
                        setError(err.message || 'An unexpected error occurred.');
                    }
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchAnalysis();
        return () => { isCancelled = true; };
    }, [username, isRoast, startTrigger]);

    const handleStarRepo = () => {
        window.open('https://github.com/danishansari-dev/ai-github-analyzer', '_blank');
        localStorage.setItem('has_starred', 'true');
        setStarRequired(false);
        setStartTrigger(prev => prev + 1);
    };

    const handleAlreadyStarred = () => {
        localStorage.setItem('has_starred', 'true');
        setStarRequired(false);
        setStartTrigger(prev => prev + 1);
    };

    const KNOWN_LANGUAGE_LIKE = new Set([
        'JavaScript',
        'TypeScript',
        'Python',
        'React',
        'Vue',
        'Node.js',
        'HTML',
        'CSS',
        'Tailwind',
        'Go',
        'Rust',
        'Java',
        'C++',
        'Docker',
        'Git',
        'Jupyter Notebook',
        'Shell',
        'Ruby',
        'PHP',
        'Swift',
        'Kotlin',
        'Dart',
        'Scala',
        'R',
        'SCSS'
    ]);

    let topLanguages = [];
    const primaryStack = data?.stack?.primary_stack || [];
    if (primaryStack && primaryStack.length > 0) {
        // Prefer known language-like items but always try to surface at least 3 entries overall (up to 8 max)
        const languageLike = primaryStack.filter(item => KNOWN_LANGUAGE_LIKE.has(item));
        if (languageLike.length === 0) {
            topLanguages = primaryStack.slice(0, 8);
        } else {
            topLanguages = languageLike.slice(0, 8);
            if (topLanguages.length < 3) {
                for (const item of primaryStack) {
                    if (topLanguages.includes(item)) continue;
                    topLanguages.push(item);
                    if (topLanguages.length >= Math.min(8, Math.max(3, primaryStack.length))) break;
                }
            }
        }
    }

    const [scoreProgress, setScoreProgress] = useState(0);

    useEffect(() => {
        if (!data) return;
        setScoreProgress(0);
        const timeout = setTimeout(() => {
            setScoreProgress(data.overall_score || 0);
        }, 50);
        return () => clearTimeout(timeout);
    }, [data]);

    const getScoreGradient = (value) => {
        if (value <= 40) {
            return { from: '#fb923c', to: '#ef4444' }; // orange -> red
        }
        if (value <= 69) {
            return { from: '#facc15', to: '#fb923c' }; // yellow -> orange
        }
        if (value <= 84) {
            return { from: '#facc15', to: '#22c55e' }; // yellow -> green
        }
        return { from: '#22c55e', to: '#22d3ee' }; // green -> cyan
    };

    const { from: scoreFrom, to: scoreTo } = getScoreGradient(scoreProgress);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-[60px] scroll-smooth transition-opacity duration-300">
            <style>
                {`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .print-card { 
                        background: white !important; 
                        border: 1px solid #e5e7eb !important; 
                        box-shadow: none !important;
                        break-inside: avoid;
                    }
                    .text-gray-400, .text-gray-500, .text-gray-600 { color: #4b5563 !important; }
                    .bg-white\\/\\[0\\.02\\], .bg-\\[\\#111111\\] { background: #f9fafb !important; }
                    .border-white\\/5, .border-\\[\\#1f1f1f\\] { border-color: #e5e7eb !important; }
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>

            <main className="w-full max-w-[1400px] mx-auto px-6 py-10 space-y-10">
                {loading && !error && <LoadingScreen />}

                {error && (
                    <div className="p-12 rounded-2xl bg-red-500/5 border border-red-500/20 text-center max-w-xl mx-auto">
                        <div className="text-5xl mb-6">
                            {errorCode === 404 ? '🔍' : errorCode === 429 ? '⏳' : '😞'}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {errorCode === 404 ? 'User Not Found' : errorCode === 429 ? 'Rate Limited' : 'Analysis Failed'}
                        </h2>
                        <p className="text-gray-400 mb-8">{error}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold transition-all"
                            >
                                ← Try Another
                            </button>
                            {errorCode !== 404 && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {!loading && data && (
                    <div className="space-y-10 animate-in fade-in duration-500">

                        {/* HERO ROW - 3 COL GRID ON DESKTOP (Profile, Score, Top Languages) */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_1.3fr] gap-4 items-stretch">

                            {/* LEFT: Profile */}
                            <GlowCard
                                customSize
                                className="print-card"
                            >
                                <div
                                    className="rounded-2xl bg-[#111111] border border-[#1f1f1f] flex flex-col h-full"
                                    style={{ animation: 'fadeUp 0.6s ease-out forwards', opacity: 0, animationDelay: '0ms' }}
                                >
                                    <div className="p-8">
                                        <ProfileCard data={data} username={username} />
                                    </div>
                                </div>
                            </GlowCard>

                            {/* CENTER LEFT: Score & Summary */}
                            <GlowCard
                                customSize
                                className="print-card"
                            >
                                <div
                                    className="rounded-2xl bg-[#111111] border border-[#1f1f1f] flex flex-col items-center justify-center text-center overflow-hidden"
                                    style={{ animation: 'fadeUp 0.6s ease-out forwards', opacity: 0, animationDelay: '120ms' }}
                                >
                                    <div className="flex flex-col items-center justify-center flex-grow py-8 px-8">
                                    <p className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-2">
                                        Profile Score
                                    </p>
                                    {/* Circular Score Ring */}
                                    <div className="relative w-44 h-44 flex items-center justify-center mb-10">
                                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                            <defs>
                                                <linearGradient id="score-ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor={scoreFrom} />
                                                    <stop offset="100%" stopColor={scoreTo} />
                                                </linearGradient>
                                            </defs>
                                            <circle
                                                cx="88" cy="88" r="82"
                                                fill="none"
                                                className="stroke-gray-800/50"
                                                strokeWidth="10"
                                            />
                                            <circle
                                                cx="88" cy="88" r="82"
                                                fill="none"
                                                stroke="url(#score-ring-gradient)"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                strokeDasharray="515"
                                                strokeDashoffset={515 - (515 * scoreProgress) / 100}
                                                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                                            />
                                        </svg>
                                        <div className="z-10 flex flex-col items-center">
                                            <div className="flex items-baseline font-black leading-none">
                                                <span className="text-6xl tracking-tight" style={{ color: scoreFrom }}>
                                                    {data.overall_score}
                                                </span>
                                                <span className="text-xl text-gray-600 ml-1">/100</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="max-w-md">
                                        <p className="text-gray-500 italic text-sm leading-relaxed">
                                            {data.stack?.profile_summary}
                                        </p>
                                    </div>
                                </div>
                                </div>
                            </GlowCard>

                            {/* RIGHT: Top Languages Orbit */}
                            {topLanguages.length > 0 && (
                                <GlowCard
                                    customSize
                                    className="print-card"
                                >
                                    <div
                                        className="rounded-2xl bg-[#111111] border border-[#1f1f1f] flex flex-col items-center justify-center text-center min-h-[460px] min-w-0 overflow-visible p-8"
                                        style={{ animation: 'fadeUp 0.6s ease-out forwards', opacity: 0, animationDelay: '240ms' }}
                                    >
                                        <p className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-4">
                                            Top Languages
                                        </p>
                                        <OrbitingSkills skills={topLanguages} />
                                    </div>
                                </GlowCard>
                            )}
                        </div>

                        {/* SECOND ROW - 2 COL GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <GlowCard customSize className="print-card">
                                <div className="rounded-2xl bg-[#111111] border border-[#1f1f1f] h-full p-8">
                                    <RepoShowcase repos={data.top_repos} />
                                </div>
                            </GlowCard>
                            <GlowCard customSize className="print-card">
                                <div className="rounded-2xl bg-[#111111] border border-[#1f1f1f] h-full p-8 overflow-hidden">
                                    <GitHubStats username={username} />
                                </div>
                            </GlowCard>
                        </div>

                        {/* THIRD ROW - FULL WIDTH */}
                        <GlowCard customSize className="print-card">
                            <div className="rounded-2xl bg-[#111111] border border-[#1f1f1f] h-full p-8">
                                <RoleScoreCard scores={data.role_fit?.scores} reasoning={data.role_fit?.reasoning} />
                            </div>
                        </GlowCard>

                    </div>
                )}
            </main>

            {/* STAR GATE OVERLAY */}
            {starRequired && (
                <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center p-12 rounded-[2rem] bg-[#0d0d0d] border border-[#1f1f1f] shadow-2xl">
                        <div className="text-6xl mb-8 animate-pulse text-yellow-500">⭐</div>
                        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">One small step...</h2>
                        <p className="text-gray-500 mb-10 text-lg leading-relaxed font-medium">
                            Star our repo to unlock this free premium analysis. It helps us keep the servers running!
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={handleStarRepo}
                                className="w-full py-5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                ⭐ Star on GitHub
                            </button>
                            <button
                                onClick={handleAlreadyStarred}
                                className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-gray-500 font-bold hover:text-gray-300 transition-all text-xs uppercase tracking-widest"
                            >
                                I already starred it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                    ✅ {toast}
                </div>
            )}
        </div>
    );
}

export default Results;
