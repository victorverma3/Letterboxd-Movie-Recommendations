import { useEffect, useState } from "react";

interface CycleTextProps {
    texts: string[];
    cycleTime: number;
}

const CycleText = (props: CycleTextProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(
                (prevIndex) => (prevIndex + 1) % props.texts.length
            );
        }, props.cycleTime);
        return () => clearInterval(interval);
    });

    return (
        <div className="w-full flex justify-center items-center">
            {props.texts.map((text, index) => (
                <p
                    key={index}
                    className={`max-w-3/5 sm:max-w-4/5 text-md sm:text-lg absolute transition-opacity duration-1000 ease-in-out ${
                        index === currentIndex ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {text}
                </p>
            ))}
        </div>
    );
};

export default CycleText;
