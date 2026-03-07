import { useState } from 'react';

/**
 * ResumeBullets — The hero feature of the app.
 * Renders AI-generated resume bullet points grouped by project,
 * each with individual copy buttons and a global "Copy All" action.
 */
function ResumeBullets({ resume_bullets }) {
    // Track which individual bullet was just copied so we can show a checkmark
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);

    /**
     * Copies a single bullet to the clipboard and shows a checkmark for 2 seconds.
     * @param text - The bullet text to copy
     * @param index - A unique compound index like "0-1" to track which bullet was copied
     */
    const copyBullet = async (text, index) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    /**
     * Copies every bullet across all projects as a single plain-text block.
     * Each project is separated by a newline for easy pasting into a resume doc.
     */
    const copyAll = async () => {
        const allText = (resume_bullets || [])
            .map((project) => {
                const header = `${project.project_name}`;
                const bullets = project.bullets.map((b) => `• ${b}`).join('\n');
                return `${header}\n${bullets}`;
            })
            .join('\n\n');

        await navigator.clipboard.writeText(allText);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    return (
        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
            {/* Header row with title and copy-all button */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">📝 Your Resume Bullets — Ready to Copy</h2>
                <button
                    onClick={copyAll}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
                >
                    {copiedAll ? '✓ Copied!' : 'Copy All Bullets'}
                </button>
            </div>

            {/* Project-grouped bullets */}
            <div className="space-y-8">
                {(resume_bullets || []).map((project, projectIndex) => (
                    <div key={projectIndex}>
                        {/* Project name links to the GitHub repo */}
                        <h3 className="text-lg font-semibold text-white mb-4">
                            <a
                                href={project.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-400 transition-colors"
                            >
                                {project.project_name} <span className="text-gray-600">↗</span>
                            </a>
                        </h3>

                        <ul className="space-y-3">
                            {(project.bullets || []).map((bullet, bulletIndex) => {
                                const uniqueKey = `${projectIndex}-${bulletIndex}`;
                                const isCopied = copiedIndex === uniqueKey;

                                return (
                                    <li
                                        key={bulletIndex}
                                        className="group flex items-start gap-3 pl-4 border-l-2 border-blue-500/30 hover:border-blue-500 transition-colors"
                                    >
                                        <span className="flex-1 text-gray-300 leading-relaxed">{bullet}</span>
                                        <button
                                            onClick={() => copyBullet(bullet, uniqueKey)}
                                            className="shrink-0 mt-0.5 px-2 py-1 rounded text-xs text-gray-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                                        >
                                            {isCopied ? '✓' : 'Copy'}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Floating toast — only appears when "Copy All" is clicked */}
            {copiedAll && (
                <div className="fixed bottom-6 right-6 px-4 py-2 rounded-lg bg-green-500/90 text-white text-sm font-medium animate-bounce z-50">
                    Copied to clipboard!
                </div>
            )}
        </div>
    );
}

export default ResumeBullets;
