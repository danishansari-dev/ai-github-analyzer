import React from 'react';

/**
 * GitHubStats component — Displays advanced GitHub summary cards 
 * using the GitHub Profile Summary Cards API.
 * 
 * @param {string} username - The GitHub username to fetch stats for
 * @returns A section containing multiple summary card widgets
 */
const GitHubStats = ({ username }) => {
    if (!username) return null;

    /**
     * Handles image load errors by hiding the broken card
     * @param {Event} e - The error event
     */
    const handleImgError = (e) => {
        e.target.style.display = 'none';
    };

    const theme = 'prussian';
    const baseUrl = 'http://github-profile-summary-cards.vercel.app/api/cards';

    return (
        <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5">
            <h2 style={{ color: 'white' }} className="text-2xl font-bold mb-6 flex items-center gap-2">
                📊 GitHub Statistics
            </h2>

            <div className="flex flex-col gap-6">
                {/* 1. Full Width - Profile Details */}
                <div className="w-full">
                    <img
                        src={`${baseUrl}/profile-details?username=${username}&theme=${theme}`}
                        alt="GitHub Profile Details"
                        style={{ width: '100%', height: 'auto' }}
                        onError={handleImgError}
                    />
                </div>

                {/* 2. Side by Side - Language Stats */}
                <div className="flex flex-wrap justify-between gap-y-4">
                    <img
                        src={`${baseUrl}/repos-per-language?username=${username}&theme=${theme}`}
                        alt="Repos per Language"
                        style={{ width: '48%', minWidth: '300px', flexGrow: 1, height: 'auto' }}
                        onError={handleImgError}
                    />
                    <img
                        src={`${baseUrl}/most-commit-language?username=${username}&theme=${theme}`}
                        alt="Most Commit Language"
                        style={{ width: '48%', minWidth: '300px', flexGrow: 1, height: 'auto' }}
                        onError={handleImgError}
                    />
                </div>

                {/* 3. Side by Side - Stats & Productive Time */}
                <div className="flex flex-wrap justify-between gap-y-4">
                    <img
                        src={`${baseUrl}/stats?username=${username}&theme=${theme}`}
                        alt="GitHub Stats"
                        style={{ width: '48%', minWidth: '300px', flexGrow: 1, height: 'auto' }}
                        onError={handleImgError}
                    />
                    <img
                        src={`${baseUrl}/productive-time?username=${username}&theme=${theme}&utcOffset=+5.5`}
                        alt="Productive Time"
                        style={{ width: '48%', minWidth: '300px', flexGrow: 1, height: 'auto' }}
                        onError={handleImgError}
                    />
                </div>
            </div>
        </div>
    );
};

export default GitHubStats;
