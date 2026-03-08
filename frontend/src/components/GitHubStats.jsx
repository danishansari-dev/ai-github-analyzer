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

        // OSS Insight requires a numeric user ID, so we fetch it from the public profile
        fetch(`https://api.github.com/users/${username}`)
            .then(r => r.json())
            .then(data => {
                if (data.id) setUserId(data.id);
            })
            .catch(err => console.error("Error fetching GitHub user_id:", err));
    }, [username]);

    if (!username) return null;

    /**
     * Handles image load errors by hiding the broken card
     * @param {Event} e - The error event
     */
    const handleImgError = (e) => {
        e.target.style.display = 'none';
    };

    const theme = 'github_dark';
    const baseUrl = 'http://github-profile-summary-cards.vercel.app/api/cards';

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-[#0d1117]" style={{ marginBottom: '24px' }}>
            <h2 className="text-white text-xl font-semibold mb-5 flex items-center gap-2">
                📊 GitHub Statistics
            </h2>

            {/* 
              Responsive grid: single column on mobile, 2 columns on ≥768px.
              Using Tailwind's responsive prefix instead of inline styles so mobile stacks properly. 
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 0: OSS Insight Dashboard full width */}
                {userId && (
                    <div className="md:col-span-2">
                        <img
                            src={`https://next.ossinsight.io/widgets/official/compose-user-dashboard-stats/thumbnail.png?user_id=${userId}&image_size=auto&color_scheme=dark`}
                            alt="OSS Insight Dashboard"
                            className="w-full rounded-xl mb-4"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                )}

                {/* Row 1: profile-details full width */}
                <div className="md:col-span-2">
                    <img
                        src={`${baseUrl}/profile-details?username=${username}&theme=${theme}`}
                        alt="Profile Details"
                        className="w-full rounded-xl hover:scale-[1.01] transition-transform duration-200"
                        onError={handleImgError}
                    />
                </div>

                {/* Row 2: repos-per-language + most-commit-language */}
                <img
                    src={`${baseUrl}/repos-per-language?username=${username}&theme=${theme}`}
                    alt="Repos per Language"
                    className="w-full rounded-xl hover:scale-[1.01] transition-transform duration-200"
                    onError={handleImgError}
                />
                <img
                    src={`${baseUrl}/most-commit-language?username=${username}&theme=${theme}`}
                    alt="Most Commit Language"
                    className="w-full rounded-xl hover:scale-[1.01] transition-transform duration-200"
                    onError={handleImgError}
                />

                {/* Row 3: stats + productive-time */}
                <img
                    src={`${baseUrl}/stats?username=${username}&theme=${theme}`}
                    alt="General Stats"
                    className="w-full rounded-xl hover:scale-[1.01] transition-transform duration-200"
                    onError={handleImgError}
                />
                <img
                    src={`${baseUrl}/productive-time?username=${username}&theme=${theme}&utcOffset=+5.5`}
                    alt="Productive Time"
                    className="w-full rounded-xl hover:scale-[1.01] transition-transform duration-200"
                    onError={handleImgError}
                />
            </div>
        </div>
    );
};

export default GitHubStats;
