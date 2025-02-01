import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Label,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import { DistributionResponse } from "../../types/StatisticsTypes";
import { useEffect, useState } from "react";

const countUserFrequencies = (values: number[]) => {
    const frequencies: { [key: number]: number } = {};

    for (let i = 0; i <= 5; i += 0.5) {
        frequencies[parseFloat(i.toFixed(1))] = 0;
    }

    values.forEach((value) => {
        frequencies[value]++;
    });

    for (const key in frequencies) {
        frequencies[key] = frequencies[key] / values.length;
    }

    return frequencies;
};

const generateRanges = (step: number, max: number): number[] => {
    const ranges = [];
    for (let i = 0; i <= max; i += step) {
        ranges.push(parseFloat(i.toFixed(2)));
    }
    return ranges;
};

const countLetterboxdFrequencies = (values: number[], ranges: number[]) => {
    const frequencies: { [range: string]: number } = {};

    for (let i = 0; i < ranges.length - 1; i++) {
        const rangeKey = `${ranges[i]}-${ranges[i + 1]}`;
        frequencies[rangeKey] = 0;
    }

    values.forEach((value) => {
        for (let i = 0; i < ranges.length - 1; i++) {
            if (value >= ranges[i] && value < ranges[i + 1]) {
                const rangeKey = `${ranges[i]}-${ranges[i + 1]}`;
                frequencies[rangeKey]++;
                break;
            }
        }
    });

    for (const key in frequencies) {
        frequencies[key] = frequencies[key] / values.length;
    }

    return frequencies;
};

interface DistributionChartProps {
    data: DistributionResponse;
}

const DistributionChart = ({ data }: DistributionChartProps) => {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const userFrequencies = countUserFrequencies(data.user_rating_values);
        const ranges = generateRanges(0.05, 5);
        const letterboxdFrequencies = countLetterboxdFrequencies(
            data.letterboxd_rating_values,
            ranges
        );

        const combinedData = Object.entries(userFrequencies).map(
            ([value, userFreq]) => ({
                range: value,
                user: userFreq,
                letterboxd:
                    letterboxdFrequencies[`${value}-${+value + 0.5}`] || 0,
            })
        );

        setChartData(combinedData);
    }, [data]);

    return (
        <ResponsiveContainer width="100%" aspect={2}>
            <BarChart data={chartData}>
                <Bar dataKey="user" fill="#8884d8" />
                <Bar dataKey="letterboxd" fill="#ffffff" />
                <XAxis dataKey={"range"} />
                <YAxis />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DistributionChart;
