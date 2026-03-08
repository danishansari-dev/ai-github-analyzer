import { useState, useEffect } from 'react';

/**
 * Full-screen loading screen that provides feedback during the AI analysis process.
 * Features cycling messages, a timed progress bar, and premium dark theme styling.
 */

const LOADING_MESSAGES = [
    "Fetching your GitHub repos...",
    "Reading your READMEs and code...",
    "Detecting your tech stack...",
    "Scoring 50+ career roles...",
    "Mapping your developer profile...",
    "Almost there..."
];

function LoadingScreen() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Cycle through messages every 2.5 seconds as requested
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Animate progress bar from 0% to 90% over 30 seconds
    useEffect(() => {
        const duration = 30000; // 30 seconds
        const intervalTime = 100; // update every 100ms
        const totalSteps = duration / intervalTime;
        const increment = 90 / totalSteps;

        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + increment;
                return next >= 90 ? 90 : next;
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0f] text-white">
            {/* Background ambient glow for premium feel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
                {/* Modern Spinner */}
                <div className="relative w-16 h-16 mb-10">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500/30 animate-spin-slow" />
                </div>

                {/* Status Message - Directly below spinner */}
                <h2 className="text-xl font-medium text-white mb-6 h-8 animate-pulse">
                    {LOADING_MESSAGES[messageIndex]}
                </h2>

                {/* Progress bar container */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-violet-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Subtitle */}
                <p className="text-xs text-gray-400 uppercase tracking-[0.25em] font-bold mt-2">
                    Powered by Groq LLaMA 3.3 70B
                </p>
            </div>

            {/* Subtle bottom indicator */}
            <div className="absolute bottom-12 flex gap-1.5">
                {LOADING_MESSAGES.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === messageIndex ? 'bg-blue-500 w-4' : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

export default LoadingScreen;
