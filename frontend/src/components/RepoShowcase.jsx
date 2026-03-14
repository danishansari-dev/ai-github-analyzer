/**
 * RepoShowcase — Displays the developer's top repositories by stars.
 * Gives visitors a quick glance at the user's most popular open-source work
 * before diving deeper into stats or role analysis.
 *
 * @param {Array} repos - Array of top repo objects from the API
 */

// GitHub-style language colors for badge display (with brand-aligned accents)
const LANG_COLORS = {
    Python: '#3776AB',
    JavaScript: '#F7DF1E',
    TypeScript: '#3178C6',
    Svelte: '#FF3E00',
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

function RepoShowcase({ repos, username }) {
    if (!repos || repos.length === 0) return null;

    const repoUrl = (repo) => repo.html_url || (username ? `https://github.com/${username}/${repo.name}` : '#');

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🗂️</span>
                <h2 className="text-[10px] tracking-widest text-white/40 uppercase font-semibold">
                    Top Repositories
                </h2>
            </div>
            <p className="text-[10px] text-gray-600 mb-4 uppercase tracking-wider">sorted by stars &amp; commits</p>

            <div className="grid grid-cols-1 gap-2">
                {repos.slice(0, 5).map((repo) => {
                    const displayLang = repo.language ? (langMap[repo.language] || repo.language) : null;
                    return (
                        <a
                            key={repo.name}
                            href={repoUrl(repo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col rounded-lg px-3 py-3 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                                    {repo.name}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                    <span className="bg-white/5 rounded px-1.5 py-0.5 text-xs flex items-center gap-1">
                                        ★ {repo.stars}
                                    </span>
                                    <span className="bg-white/5 rounded px-1.5 py-0.5 text-xs flex items-center gap-1">
                                        🔀 {repo.total_commits || 0}
                                    </span>
                                </div>
                            </div>
                            {repo.description && (
                                <p className="text-xs text-white/40 mt-0.5 line-clamp-1">
                                    {repo.description}
                                </p>
                            )}
                            {displayLang && (
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: LANG_COLORS[displayLang] || '#8b949e' }}
                                    />
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                        {displayLang}
                                    </span>
                                </div>
                            )}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

export default RepoShowcase;
