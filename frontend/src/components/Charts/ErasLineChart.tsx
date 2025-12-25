import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Label,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import useIsScreenSm from "../../hooks/useIsScreenSm";

const COLORS = ["#7f5539", "#e6ccb2"];

interface ErasLineChartProps {
    data: Record<string, Record<number, number>>;
}

const ErasLineChart = ({ data }: ErasLineChartProps) => {
    const isScreenSm = useIsScreenSm();
    const users = Object.keys(data);

    const allEras = Array.from(
        new Set(users.flatMap((u) => Object.keys(data[u])))
    )
        .map(Number)
        .sort((a, b) => a - b);

    const chartData = allEras.map((era) => {
        const entry: Record<string, string | number | null> = {
            era: `${era}s`,
        };
        users.forEach((u) => {
            entry[u] = data[u][era] ?? null;
        });
        return entry;
    });

    return (
        <div className="w-full flex flex-col">
            <h3 className="w-fit mx-auto text-lg sm:text-xl">
                Era Preferences
            </h3>
            <ResponsiveContainer width="100%" aspect={1.5}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="era"
                        type="category"
                        tick={{ fontSize: isScreenSm ? 12 : 10 }}
                        domain={["dataMin", "dataMax"]}
                    />
                    <YAxis
                        domain={[0, 5]}
                        tick={{ fontSize: isScreenSm ? 12 : 10 }}
                    >
                        <Label
                            value="Average Rating"
                            position="insideLeft"
                            offset={10}
                            angle={-90}
                            style={{
                                textAnchor: "middle",
                                fontSize: isScreenSm ? 16 : 12,
                            }}
                        />
                    </YAxis>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: isScreenSm ? 16 : 12 }} />
                    {users.map((user, i) => (
                        <Line
                            key={user}
                            type="monotone"
                            dataKey={user}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ErasLineChart;
