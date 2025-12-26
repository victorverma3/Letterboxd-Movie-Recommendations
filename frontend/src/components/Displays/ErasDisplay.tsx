import { EraStatsResponse } from "../../types/StatisticsTypes";

interface ErasDisplayProps {
    era_averages: EraStatsResponse;
}

const ErasDisplay = ({ era_averages }: ErasDisplayProps) => {
    return (
        <div className="w-full mx-auto my-8 flex flex-row flex-wrap gap-8 justify-center text-center">
            <div className="flex flex-row gap-8">
                <div className="w-28 mx-auto">
                    <h2 className="text-lg">Silent Era Average</h2>
                    <p className="text-3xl text-palette-darkbrown font-semibold">
                        {era_averages.silent}
                    </p>
                </div>
                <div className="w-28 mx-auto">
                    <h2 className="text-lg">Sound Era Average</h2>
                    <p className="text-3xl text-palette-darkbrown font-semibold">
                        {era_averages.sound}
                    </p>
                </div>
            </div>
            <div className="flex flex-row gap-8">
                <div className="w-28 mx-auto">
                    <h2 className="text-lg">Color Era Average</h2>
                    <p className="text-3xl text-palette-darkbrown font-semibold">
                        {era_averages.color}
                    </p>
                </div>
                <div className="w-28 mx-auto">
                    <h2 className="text-lg">Modern Era Average</h2>
                    <p className="text-3xl text-palette-darkbrown font-semibold">
                        {era_averages.modern}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ErasDisplay;
