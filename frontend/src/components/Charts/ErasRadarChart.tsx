import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { EraStatsResponse } from "../../types/StatisticsTypes";

import useIsScreenSm from "../../hooks/useIsScreenSm";

interface ErasRadarChartProps {
    era_averages: EraStatsResponse;
}

const ErasRadarChart = ({ era_averages }: ErasRadarChartProps) => {
    const isScreenSm = useIsScreenSm();

    const chartData = Object.entries(era_averages).map(([era, value]) => ({
        era: `${era.slice(0, 1).toUpperCase()}` + `${era.slice(1)}` + " Era",
        rating: value,
    }));

    return (
        <div className="w-full flex flex-col">
            <ResponsiveContainer width="100%" aspect={1.5}>
                <RadarChart data={chartData}>
                    <PolarGrid />

                    <PolarAngleAxis
                        dataKey="era"
                        tick={
                            isScreenSm
                                ? { fontSize: 12, fill: "#000000" }
                                : { fontSize: 8, fill: "#000000" }
                        }
                    />

                    <PolarRadiusAxis
                        domain={[0, 5]}
                        tickCount={6}
                        tick={{
                            fontSize: 10,
                            fill: "#ffffff",
                        }}
                    />

                    {isScreenSm && <Tooltip />}

                    <Legend
                        wrapperStyle={{
                            fontSize: isScreenSm ? "16px" : "12px",
                        }}
                    />

                    <Radar
                        name="Average Rating"
                        dataKey="rating"
                        stroke="#b08968"
                        fill="#b08968"
                        fillOpacity={0.25}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ErasRadarChart;
