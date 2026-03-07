import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import ProfileCard from '../components/ProfileCard';
import RoleScoreCard from '../components/RoleScoreCard';
import ResumeBullets from '../components/ResumeBullets';
import GitHubStats from '../components/GitHubStats';

// Fix #1: 30-second timeout so the loading screen never spins forever
const FETCH_TIMEOUT_MS = 90000;

// Fix #2: Use production API URL if available, else fallback to empty string (Vite proxy)
const apiUrl = import.meta.env.VITE_API_URL || '';

/**
 * Results page — Fetches analysis data from the backend for a given GitHub username
 * and renders the three main result cards: ProfileCard, RoleScoreCard, and ResumeBullets.
 * Handles loading, error, timeout, and success states.
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

            // AbortController used here specifically for the timeout mechanism,
            // not for StrictMode cleanup (that's handled by isCancelled flag)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            try {
                const response = await fetch(`${apiUrl}/api/analyze/${encodeURIComponent(username)}`, {
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (isCancelled) return;

                if (!response.ok) {
                    // Try to extract the real error message from FastAPI's JSON response
                    const errorData = await response.json().catch(() => null);
                    const apiMessage = errorData?.detail || null;

                    if (response.status === 404) {
                        throw new Error(apiMessage || `User "${username}" not found on GitHub.`);
                    } else if (response.status === 429) {
                        throw new Error(apiMessage || 'GitHub API rate limit exceeded. Please try again in about an hour.');
                    } else {
                        // Show the ACTUAL error from the backend so we always know what really failed
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
                    // Distinguish between user-triggered abort (timeout) vs other errors
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

    /**
     * Copies the current page URL to the clipboard for sharing.
     */
    const handleShare = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setShareText('✓ Link Copied!');
        setTimeout(() => setShareText('Share This Analysis'), 2000);
    };

    // Debug logging — helps trace state issues in the browser console
    console.log("State:", { loading, error, data });

    if (loading) return <LoadingScreen />;

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-6">😞</div>
                    <h2 className="text-2xl font-bold text-white mb-3">Oops!</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                        >
                            ← Go Home
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback: prevents a blank screen if state is somehow stuck
    if (!data) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-red-400 text-lg mb-4">No data loaded yet.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Top bar */}
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

            {/* Results content */}
            <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
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
                    top_role={data.role_fit?.top_role}
                    top_role_label={data.role_fit?.top_role_label}
                    reasoning={data.role_fit?.reasoning}
                />

                <ResumeBullets resume_bullets={data.resume_bullets} />
            </main>
        </div>
    );
}

export default Results;
