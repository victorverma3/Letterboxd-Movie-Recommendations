type QA = {
    question: string;
    answer: string;
};

interface FAQSectionProps {
    title: string;
    items: QA[];
}

const FAQSection = (props: FAQSectionProps) => {
    return (
        <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mt-16 mx-auto flex flex-col space-y-4">
            <h2 className="text-bold text-xl sm:text-2xl underline decoration-palette-darkbrown">
                {props.title}
            </h2>
            {props.items.map((item, index) => (
                <div key={index} className="flex flex-col space-y-4">
                    <h3 className="text-bold text-md sm:text-lg">
                        {item.question}
                    </h3>
                    <p className="mx-auto text-justify sm:text-start text-xs sm:text-sm">
                        {item.answer}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default FAQSection;
