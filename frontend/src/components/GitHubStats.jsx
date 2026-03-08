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

    // CSS Styles to match the GitHub dark theme
    const styles = {
        container: {
            backgroundColor: '#0d1117',
            borderRadius: '16px', // Matches 'rounded-2xl' Roughly
            padding: '24px',
            border: '1px solid #30363d',
            marginBottom: '24px',
        },
        heading: {
            color: 'white',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
        },
        fullWidth: {
            gridColumn: '1 / -1',
        },
        cardImg: {
            borderRadius: '12px',
            overflow: 'hidden',
            width: '100%',
            height: 'auto',
            transition: 'transform 0.2s ease',
        },
    };

    /**
     * Adds scaling effect on hover
     */
    const handleHover = (e, isEnter) => {
        e.currentTarget.style.transform = isEnter ? 'scale(1.01)' : 'scale(1)';
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>📊 GitHub Statistics</h2>

            <div style={styles.grid}>
                {/* Row 0: OSS Insight Dashboard full width */}
                {userId && (
                    <div style={styles.fullWidth}>
                        <img
                            src={`https://next.ossinsight.io/widgets/official/compose-user-dashboard-stats/thumbnail.png?user_id=${userId}&image_size=auto&color_scheme=dark`}
                            alt="OSS Insight Dashboard"
                            style={{ width: '100%', borderRadius: '12px', marginBottom: '16px' }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                )}

                {/* Row 1: profile-details full width */}
                <div style={styles.fullWidth}>

                    <img
                        src={`${baseUrl}/profile-details?username=${username}&theme=${theme}`}
                        alt="Profile Details"
                        style={styles.cardImg}
                        onMouseEnter={(e) => handleHover(e, true)}
                        onMouseLeave={(e) => handleHover(e, false)}
                        onError={handleImgError}
                    />
                </div>

                {/* Row 2: repos-per-language + most-commit-language */}
                <img
                    src={`${baseUrl}/repos-per-language?username=${username}&theme=${theme}`}
                    alt="Repos per Language"
                    style={styles.cardImg}
                    onMouseEnter={(e) => handleHover(e, true)}
                    onMouseLeave={(e) => handleHover(e, false)}
                    onError={handleImgError}
                />
                <img
                    src={`${baseUrl}/most-commit-language?username=${username}&theme=${theme}`}
                    alt="Most Commit Language"
                    style={styles.cardImg}
                    onMouseEnter={(e) => handleHover(e, true)}
                    onMouseLeave={(e) => handleHover(e, false)}
                    onError={handleImgError}
                />

                {/* Row 3: stats + productive-time */}
                <img
                    src={`${baseUrl}/stats?username=${username}&theme=${theme}`}
                    alt="General Stats"
                    style={styles.cardImg}
                    onMouseEnter={(e) => handleHover(e, true)}
                    onMouseLeave={(e) => handleHover(e, false)}
                    onError={handleImgError}
                />
                <img
                    src={`${baseUrl}/productive-time?username=${username}&theme=${theme}&utcOffset=+5.5`}
                    alt="Productive Time"
                    style={styles.cardImg}
                    onMouseEnter={(e) => handleHover(e, true)}
                    onMouseLeave={(e) => handleHover(e, false)}
                    onError={handleImgError}
                />
            </div>
        </div>
    );
};

export default GitHubStats;
