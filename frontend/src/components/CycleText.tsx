import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CycleTextProps {
    texts: string[];
    cycleTime: number;
}

const CycleText = ({ texts, cycleTime }: CycleTextProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, cycleTime);
        return () => clearInterval(interval);
    }, [texts.length, cycleTime]);

    return (
        <div className="w-full flex justify-center items-center relative">
            <AnimatePresence mode="wait">
                <motion.p
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3/5 sm:max-w-4/5 text-md sm:text-lg absolute"
                >
                    {texts[currentIndex]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
};

export default CycleText;
