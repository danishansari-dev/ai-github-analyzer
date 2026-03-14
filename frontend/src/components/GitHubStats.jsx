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

            {/* OSS Insight Dashboard — full width */}
            {userId && (
                <div className="w-full flex justify-center">
                    <img
                        src={`https://next.ossinsight.io/widgets/official/compose-user-dashboard-stats/thumbnail.png?user_id=${userId}&image_size=auto&color_scheme=dark`}
                        alt="OSS Insight Dashboard"
                        className="w-full max-w-4xl rounded-xl"
                        loading="lazy"
                        onError={hideImg}
                    />
                </div>
            )}

            {/* GitHub Stats + Streak — side by side */}
            <div className="w-full flex flex-col md:flex-row gap-4 justify-center">
                <img
                    src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=radical&count_private=true`}
                    alt="GitHub Stats"
                    className="w-full md:w-[49%] rounded-xl"
                    loading="lazy"
                    onError={hideImg}
                />
                <img
                    src={`https://github-readme-streak-stats.herokuapp.com?user=${username}&theme=radical`}
                    alt="GitHub Streak"
                    className="w-full md:w-[49%] rounded-xl"
                    loading="lazy"
                    onError={hideImg}
                />
            </div>

            {/* Top Languages + LeetCode — side by side */}
            <div className="w-full flex flex-col md:flex-row gap-4 justify-center">
                <img
                    src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical&langs_count=8`}
                    alt="Top Languages"
                    className="w-full md:w-[49%] rounded-xl"
                    loading="lazy"
                    onError={hideImg}
                />
                <img
                    src={`https://leetcard.jacoblin.cool/${username}?theme=radical&font=Karma&ext=heatmap`}
                    alt="LeetCode Stats"
                    className="w-full md:w-[49%] rounded-xl"
                    loading="lazy"
                    onError={hideImg}
                />
            </div>

            {/* Activity Graph — full width */}
            <div className="w-full flex justify-center">
                <img
                    src={`https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=react-dark&hide_border=true&area=true`}
                    alt="GitHub Activity Graph"
                    className="w-full max-w-4xl rounded-xl"
                    loading="lazy"
                    onError={hideImg}
                />
            </div>

        </div>
    );
}
