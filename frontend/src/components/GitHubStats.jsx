import React, { useState, useEffect } from 'react';

/**
 * GitHubStats component — Displays advanced GitHub summary cards 
 * using the GitHub Profile Summary Cards API and OSS Insight.
 * 
 * @param {string} username - The GitHub username to fetch stats for
 * @returns A section containing multiple summary card widgets
 */
const GitHubStats = ({ username }) => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (!username) return;
        fetch(`https://api.github.com/users/${username}`)
            .then(r => r.json())
            .then(data => {
                if (data.id) setUserId(data.id);
            })
            .catch(() => {});
    }, [username]);

    if (!username) return null;

    const handleImgError = (e) => {
        e.target.style.display = 'none';
        // If parent is a 2x2 grid item and it fails, we might want to hide the wrapper too
        if (e.target.parentElement.classList.contains('count-card')) {
            e.target.parentElement.style.display = 'none';
        }
    };

    const theme = 'custom'; // Custom theme to match our #111111 background
    const themeColor = '111111';
    const baseUrl = 'https://github-profile-summary-cards.vercel.app/api/cards';

    return (
        <div className="flex flex-col w-full">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                📊 GitHub Statistics
            </h2>

            <div className="flex flex-col gap-4 w-full">
                {/* Full Width OSS Insight */}
                {userId && (
                    <div className="w-full">
                        <img
                            src={`https://next.ossinsight.io/widgets/official/compose-user-dashboard-stats/thumbnail.png?user_id=${userId}&image_size=auto&color_scheme=dark`}
                            alt="OSS Insight Dashboard"
                            className="w-full rounded-xl border border-[#1f1f1f]"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                )}

                {/* Contribution Graph (Summary Cards version) */}
                <div className="w-full">
                    <img
                        src={`${baseUrl}/profile-details?username=${username}&theme=github_dark`}
                        alt="Profile Details"
                        className="w-full rounded-xl border border-[#1f1f1f]"
                        onError={handleImgError}
                    />
                </div>

                {/* Summary cards — wider grid for full-width layout */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#111111]">
                        <img
                            src={`${baseUrl}/repos-per-language?username=${username}&theme=github_dark`}
                            alt="Repos per Language"
                            className="w-full h-auto"
                            onError={handleImgError}
                        />
                    </div>
                    <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#111111]">
                        <img
                            src={`${baseUrl}/most-commit-language?username=${username}&theme=github_dark`}
                            alt="Most Commit Language"
                            className="w-full h-auto"
                            onError={handleImgError}
                        />
                    </div>
                    <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#111111]">
                        <img
                            src={`${baseUrl}/stats?username=${username}&theme=github_dark`}
                            alt="General Stats"
                            className="w-full h-auto"
                            onError={handleImgError}
                        />
                    </div>
                    <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#111111]">
                        <img
                            src={`${baseUrl}/productive-time?username=${username}&theme=github_dark&utcOffset=+5.5`}
                            alt="Productive Time"
                            className="w-full h-auto"
                            onError={handleImgError}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GitHubStats;
