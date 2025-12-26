import {
    BarChart,
    Bar,
    Label,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { EraStatsResponse } from "../../types/StatisticsTypes";

interface ErasChartProps {
    era_averages: EraStatsResponse;
}

const ErasChart = ({ era_averages }: ErasChartProps) => {
    const ERA_CONFIG = ["silent", "sound", "color", "modern"] as const;
    const chartData = ERA_CONFIG.map((key) => ({
        era: key.slice(0, 1).toUpperCase() + key.slice(1),
        rating: era_averages[key],
    }));
    return (
        <div>
            <ResponsiveContainer width="100%" aspect={1.5}>
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
                >
                    <YAxis type="number" domain={[0, 5]} tickCount={6}>
                        <Label
                            value="Average Rating"
                            offset={0}
                            position="left"
                            angle={-90}
                        />
                    </YAxis>
                    <XAxis type="category" dataKey="era" width={120}>
                        <Label
                            value="Era"
                            offset={-10}
                            position="insideBottom"
                        />
                    </XAxis>
                    <Tooltip formatter={(value: number) => value.toFixed(2)} />

                    <Bar
                        dataKey="rating"
                        fill="#b08968"
                        radius={[0, 4, 4, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ErasChart;
