/**
 * GitHubStats — Displays GitHub readme-style stat widgets (stats, streak, top langs,
 * LeetCode, activity graph, OSS Insight). username and userId are passed from Results.
 */
export default function GitHubStats({ username, userId }) {
    if (!username) return null;

    const hideImg = (e) => {
        e.target.style.display = 'none';
    };

    return (
        <div className="w-full flex flex-col items-center gap-6 p-6">
            <style>
                {`
                @keyframes pulse-bg {
                    0% { background-color: rgba(255, 255, 255, 0.03); }
                    50% { background-color: rgba(255, 255, 255, 0.08); }
                    100% { background-color: rgba(255, 255, 255, 0.03); }
                }
                .img-placeholder {
                    animation: pulse-bg 2s infinite ease-in-out;
                    min-height: 120px;
                }
                `}
            </style>

            {/* OSS Insight Dashboard — full width */}
            {userId && (
                <div className="w-full flex justify-center img-placeholder rounded-xl">
                    <img
                        src={`https://next.ossinsight.io/widgets/official/compose-user-dashboard-stats/thumbnail.png?user_id=${userId}&image_size=auto&color_scheme=dark`}
                        alt="OSS Insight Dashboard"
                        className="w-full max-w-4xl rounded-xl transition-opacity duration-500 opacity-0"
                        loading="lazy"
                        onLoad={(e) => { e.target.classList.remove('opacity-0'); e.target.parentElement.classList.remove('img-placeholder'); }}
                        onError={hideImg}
                    />
                </div>
            )}

            {/* GitHub Stats + Streak — side by side */}
            <div className="w-full flex flex-col md:flex-row gap-4 justify-center">
                <div className="w-full md:w-[49%] img-placeholder rounded-xl">
                    <img
                        src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=radical&count_private=true`}
                        alt="GitHub Stats"
                        className="w-full rounded-xl transition-opacity duration-500 opacity-0"
                        loading="lazy"
                        onLoad={(e) => { e.target.classList.remove('opacity-0'); e.target.parentElement.classList.remove('img-placeholder'); }}
                        onError={hideImg}
                    />
                </div>
                <div className="w-full md:w-[49%] img-placeholder rounded-xl">
                    <img
                        src={`https://github-readme-streak-stats.herokuapp.com?user=${username}&theme=radical`}
                        alt="GitHub Streak"
                        className="w-full rounded-xl transition-opacity duration-500 opacity-0"
                        loading="lazy"
                        onLoad={(e) => { e.target.classList.remove('opacity-0'); e.target.parentElement.classList.remove('img-placeholder'); }}
                        onError={hideImg}
                    />
                </div>
            </div>

            {/* Top Languages + LeetCode — side by side */}
            <div className="w-full flex flex-col md:flex-row gap-4 justify-center">
                <div className="w-full md:w-[49%] img-placeholder rounded-xl">
                    <img
                        src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical&langs_count=8`}
                        alt="Top Languages"
                        className="w-full rounded-xl transition-opacity duration-500 opacity-0"
                        loading="lazy"
                        onLoad={(e) => { e.target.classList.remove('opacity-0'); e.target.parentElement.classList.remove('img-placeholder'); }}
                        onError={hideImg}
                    />
                </div>
                <div className="w-full md:w-[49%] img-placeholder rounded-xl">
                    <img
                        src={`https://leetcard.jacoblin.cool/${username}?theme=radical&font=Karma&ext=heatmap`}
                        alt="LeetCode Stats"
                        className="w-full rounded-xl transition-opacity duration-500 opacity-0"
                        loading="lazy"
                        onLoad={(e) => { e.target.classList.remove('opacity-0'); e.target.parentElement.classList.remove('img-placeholder'); }}
                        onError={hideImg}
                    />
                </div>
            </div>

            {/* Activity Graph — full width */}
            <div className="w-full flex justify-center img-placeholder rounded-xl">
                <img
                    src={`https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=react-dark&hide_border=true&area=true`}
                    alt="GitHub Activity Graph"
                    className="w-full max-w-4xl rounded-xl transition-opacity duration-500 opacity-0"
                    loading="lazy"
                    onLoad={(e) => { e.target.classList.remove('opacity-0'); e.target.parentElement.classList.remove('img-placeholder'); }}
                    onError={hideImg}
                />
            </div>

        </div>
    );
}
