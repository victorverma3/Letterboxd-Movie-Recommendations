import {
    CartesianGrid,
    Line,
    LineChart,
    Label,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";

import { Metric } from "../../types/MetricsTypes";

interface UsersChartProps {
    data: Metric[];
}

const UsesChart = ({ data }: UsersChartProps) => {
    return (
        <ResponsiveContainer width="100%" aspect={2}>
            <LineChart
                data={data}
                margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
            >
                <Line
                    type="monotone"
                    dataKey="total_uses"
                    stroke="#7f5539"
                    strokeWidth={2}
                    dot={false}
                />
                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(date: string) =>
                        `${parseInt(date.split("-")[1], 10)}/${parseInt(
                            date.split("-")[2],
                            10
                        )}/${date.split("-")[0].slice(-2)}`
                    }
                    interval="preserveStartEnd"
                    minTickGap={50}
                >
                    <Label value="Date" offset={0} position="bottom" />
                </XAxis>
                <YAxis
                    domain={[
                        (dataMin: number) => Math.floor(dataMin / 1000) * 1000,
                        (dataMax: number) => Math.ceil(dataMax / 1000) * 1000,
                    ]}
                >
                    <Label value="Uses" offset={0} position="left" />
                </YAxis>
            </LineChart>
        </ResponsiveContainer>
    );
};

export default UsesChart;
