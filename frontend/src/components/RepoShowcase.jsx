/**
 * RepoShowcase — Displays the developer's top repositories by stars.
 * Gives visitors a quick glance at the user's most popular open-source work
 * before diving deeper into stats or role analysis.
 *
 * @param {Array} repos - Array of top repo objects from the API
 */

// GitHub-style language colors for badge display
const LANG_COLORS = {
    Python: '#3572A5',
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Jupyter: '#DA5B0B',
    R: '#198CE7',
    Scala: '#c22d40',
    Lua: '#000080',
};

function RepoShowcase({ repos }) {
    if (!repos || repos.length === 0) return null;

    return (
        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                🗂️ Top Repositories
            </h3>
            <div className="space-y-3">
                {repos.map((repo) => (
                    <a
                        key={repo.name}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-white/[0.03] border border-white/5
                                   hover:bg-white/[0.06] hover:border-white/10
                                   transition-all duration-200 group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            {/* Repo name with external-link hint */}
                            <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                {repo.name}
                                <span className="ml-1 text-gray-600 text-xs">↗</span>
                            </span>

                            {/* Star count */}
                            <span className="flex items-center gap-1 text-xs text-yellow-500/80 font-medium">
                                ⭐ {repo.stars}
                            </span>
                        </div>

                        {/* Description */}
                        {repo.description && (
                            <p className="text-sm text-gray-400 leading-relaxed mb-2 line-clamp-2">
                                {repo.description}
                            </p>
                        )}

                        {/* Language badge */}
                        {repo.language && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b949e' }}
                                />
                                {repo.language}
                            </span>
                        )}
                    </a>
                ))}
            </div>
        </div>
    );
}

export default RepoShowcase;
