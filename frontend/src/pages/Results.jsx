import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import ProfileCard from '../components/ProfileCard';
import RoleScoreCard from '../components/RoleScoreCard';

import GitHubStats from '../components/GitHubStats';

// 30-second timeout so the loading screen never spins forever
const FETCH_TIMEOUT_MS = 90000;

// Use production API URL if available, else fallback to empty string (Vite proxy)
const apiUrl = import.meta.env.VITE_API_URL || '';

/**
 * Results page — Fetches analysis data from the backend for a given GitHub username
 * and renders the main result cards: ProfileCard, GitHubStats, and RoleScoreCard.
 * The GitHubStats component is rendered unconditionally, while other cards are dependent
 * on the AI analysis results.
 */
function Results() {
    const { username: rawUsername } = useParams();
    const navigate = useNavigate();
    // URL can get a UUID hash fragment appended (e.g. "user#7392822e..."), strip it
    const username = rawUsername.split('#')[0].trim();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareText, setShareText] = useState('Share This Analysis');

    useEffect(() => {
        let isCancelled = false;

        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);

            // AbortController used here specifically for the timeout mechanism
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            try {
                const response = await fetch(`${apiUrl}/api/analyze/${encodeURIComponent(username)}`, {
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (isCancelled) return;

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const apiMessage = errorData?.detail || null;

                    if (response.status === 404) {
                        throw new Error(apiMessage || `User "${username}" not found on GitHub.`);
                    } else if (response.status === 429) {
                        throw new Error(apiMessage || 'GitHub API rate limit exceeded. Please try again in about an hour.');
                    } else {
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
    }, [username]);

    const handleShare = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setShareText('✓ Link Copied!');
        setTimeout(() => setShareText('Share This Analysis'), 2000);
    };

    console.log("State:", { loading, error, data });

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Top bar — Rendered Unconditionally */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        ← Back
                    </button>
                    <h1 className="text-sm font-medium text-gray-400">
                        Analysis for <span className="text-white font-semibold">@{username}</span>
                    </h1>
                    <button
                        onClick={handleShare}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    >
                        {shareText}
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">


                {/* 2. Error Message Section */}
                {error && (
                    <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                        <div className="text-4xl mb-4">😞</div>
                        <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10"
                            >
                                ← Go Home
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. AI Data Sections — Loading or Data Dependent */}
                {loading && !error && (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                        <p className="text-gray-400">Claude is analyzing your code...</p>
                    </div>
                )}

                {!loading && data && (
                    <div className="space-y-8 fade-in">
                        <ProfileCard
                            name={data.name}
                            username={username}
                            avatar_url={data.avatar_url}
                            profile_url={data.profile_url}
                            primary_stack={data.stack?.primary_stack}
                            domains={data.stack?.domains}
                            profile_summary={data.stack?.profile_summary}
                            strengths={data.stack?.strengths}
                            gaps={data.stack?.gaps}
                        />

                        <GitHubStats username={username} />

                        <RoleScoreCard
                            scores={data.role_fit?.scores}
                            top_3_roles={data.role_fit?.top_3_roles}
                            reasoning={data.role_fit?.reasoning}
                        />


                    </div>
                )}
            </main>
        </div>
    );
}

export default Results;
