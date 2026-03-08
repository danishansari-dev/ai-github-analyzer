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
    Python: '#3572A5',  // Combined mapping for Jupyter Notebook too
    R: '#198CE7',
    Scala: '#c22d40',
    Lua: '#000080',
    Docker: '#384d54',
    Bash: '#4EAA25',
    Make: '#ce692b'
};

const langMap = {
    "Jupyter Notebook": "Python",
    "Dockerfile": "Docker",
    "Shell": "Bash",
    "Makefile": "Make"
};

function RepoShowcase({ repos }) {
    if (!repos || repos.length === 0) return null;

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                    🗂️ Top Repositories
                </h3>
                <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">
                    sorted by stars & commits
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {repos.slice(0, 5).map((repo) => (
                    <a
                        key={repo.name}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] 
                                   hover:border-[#2f2f2f] transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate pr-4">
                                {repo.name}
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[10px] font-bold text-yellow-500/80">
                                    ★ {repo.stars}
                                </span>
                                <span className="text-[10px] font-bold text-gray-500">
                                    🔀 {repo.total_commits || 0}
                                </span>
                            </div>
                        </div>

                        {repo.description && (
                            <p className="text-xs text-gray-500 leading-relaxed truncate mb-3">
                                {repo.description}
                            </p>
                        )}

                        {repo.language && (() => {
                            const displayLang = langMap[repo.language] || repo.language;
                            return (
                                <div className="flex items-center gap-2 mt-auto">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: LANG_COLORS[displayLang] || '#8b949e' }}
                                    />
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                        {displayLang}
                                    </span>
                                </div>
                            );
                        })()}
                    </a>
                ))}
            </div>
        </div>
    );
}

export default RepoShowcase;
