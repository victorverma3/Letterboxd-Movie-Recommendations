import {
    Bar,
    ComposedChart,
    Label,
    Legend,
    Line,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import { useEffect, useState } from "react";

import { Distribution } from "../../types/ComponentTypes";
import { DistributionResponse } from "../../types/StatisticsTypes";

import useIsScreenSm from "../../hooks/useIsScreenSm";

const createHistogramData = (data: DistributionResponse, numBins: number) => {
    const minVal = 0.5;
    const maxVal = 5;
    const binSize = (maxVal - minVal) / numBins;
    const totalCount = data["user_rating_values"].length;

    const bins = Array.from({ length: numBins }, (_, i) => ({
        id: `bin-${i}`,
        bin: `${(minVal + i * binSize).toFixed(1)} - ${(
            minVal +
            (i + 1) * binSize
        ).toFixed(1)}`,
        user_rating_count: 0,
        letterboxd_rating_count: 0,
    }));

    data["user_rating_values"].forEach((value: number) => {
        const index = Math.min(
            Math.floor((value - minVal) / binSize),
            numBins - 1
        );
        bins[index]["user_rating_count"]++;
    });

    data["letterboxd_rating_values"].forEach((value: number) => {
        const index = Math.min(
            Math.floor((value - minVal) / binSize),
            numBins - 1
        );
        bins[index]["letterboxd_rating_count"]++;
    });

    bins.forEach((value: Distribution) => {
        value["user_rating_count"] = value["user_rating_count"] / totalCount;
        value["letterboxd_rating_count"] =
            value["letterboxd_rating_count"] / totalCount;
    });

    return bins;
};

interface DistributionChartProps {
    data: DistributionResponse;
}

const DistributionChart = ({ data }: DistributionChartProps) => {
    const isScreenSm = useIsScreenSm();
    const [chartData, setChartData] = useState<Distribution[]>([]);

    useEffect(() => {
        setChartData(createHistogramData(data, 10));
    }, [data]);

    return (
        <ResponsiveContainer width="100%" aspect={1.5}>
            <ComposedChart
                data={chartData}
                barGap={-10}
                margin={{
                    top: 20,
                    right: 50,
                    left: 50,
                    bottom: isScreenSm ? 100 : 75,
                }}
            >
                <XAxis
                    dataKey="bin"
                    angle={-90}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: isScreenSm ? 16 : 12 }}
                >
                    <Label
                        value="Rating Range"
                        offset={isScreenSm ? -75 : -50}
                        position="insideBottom"
                    />
                </XAxis>
                <YAxis tick={{ fontSize: isScreenSm ? 16 : 12 }}>
                    <Label
                        value="Density"
                        offset={isScreenSm ? 10 : 0}
                        position="left"
                        angle={-90}
                    />
                </YAxis>
                <Legend
                    verticalAlign="top"
                    layout="horizontal"
                    align="center"
                />
                <Bar
                    dataKey="user_rating_count"
                    fill="#b08968"
                    name="User Ratings"
                />
                <Line
                    type="monotone"
                    dataKey="letterboxd_rating_count"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={false}
                    name="Letterboxd Ratings"
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default DistributionChart;
