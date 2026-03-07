import { useState, useEffect } from 'react';

/**
 * Full-screen loading overlay displayed while the backend
 * fetches GitHub data and runs LLM analysis.
 * Cycles through progress messages to reassure users that work is happening.
 */

const LOADING_MESSAGES = [
    'Fetching your GitHub repos...',
    'Reading your READMEs...',
    'Detecting your tech stack...',
    'Calculating your role fit...',
    'Writing your resume bullets...',
    'Almost there...',
];

function LoadingScreen() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Cycle through messages every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Animate a fake progress bar to show forward momentum
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                // Cap at 90% — the remaining 10% completes when actually done
                if (prev >= 90) return 90;
                return prev + Math.random() * 8;
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center gap-8 max-w-md px-4">
                {/* Animated spinner — dual ring for visual interest */}
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs">
                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Cycling message with fade transition */}
                <p className="text-gray-400 text-lg text-center animate-pulse">
                    {LOADING_MESSAGES[messageIndex]}
                </p>

                {/* Step indicators showing which phases are complete */}
                <div className="flex gap-2 mt-4">
                    {LOADING_MESSAGES.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= messageIndex ? 'bg-blue-500' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LoadingScreen;
