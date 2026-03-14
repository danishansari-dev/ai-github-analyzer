import { useState } from 'react';

/**
 * ResumeBullets — The hero feature of the app.
 * Renders AI-generated resume bullet points grouped by project,
 * each with individual copy buttons and a global "Copy All" action.
 */
function ResumeBullets({ resume_bullets, onCopy }) {
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
        onCopy?.();
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
        onCopy?.();
    };

    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02]">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 mb-0">
                    <span className="text-lg">📝</span>
                    <h2 className="text-[10px] tracking-widest text-white/40 uppercase font-semibold">
                        Your Resume Bullets — Ready to Copy
                    </h2>
                </div>
                <button
                    onClick={copyAll}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-white/80 hover:text-white"
                >
                    {copiedAll ? '✓ Copied!' : 'Copy All Bullets'}
                </button>
            </div>

            {/* Project-grouped bullets */}
            <div className="space-y-8">
                {(resume_bullets || []).map((project, projectIndex) => (
                    <div key={projectIndex}>
                        <h3 className="font-mono text-sm text-blue-400 flex items-center gap-2 mb-2">
                            <a
                                href={project.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                            >
                                {project.project_name}
                            </a>
                            <span className="text-gray-500">↗</span>
                        </h3>

                        <ul className="space-y-0">
                            {(project.bullets || []).map((bullet, bulletIndex) => {
                                const uniqueKey = `${projectIndex}-${bulletIndex}`;
                                const isCopied = copiedIndex === uniqueKey;

                                return (
                                    <li
                                        key={bulletIndex}
                                        className="group flex items-start gap-2 text-xs text-white/65 leading-relaxed py-1 border-b border-white/5 last:border-0"
                                    >
                                        <span className="text-green-400/60 shrink-0">▸</span>
                                        <span className="flex-1">{bullet}</span>
                                        <button
                                            onClick={() => copyBullet(bullet, uniqueKey)}
                                            className="shrink-0 px-2 py-1 rounded text-xs text-gray-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
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
