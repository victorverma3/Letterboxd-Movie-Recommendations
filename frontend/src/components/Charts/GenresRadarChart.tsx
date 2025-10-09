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

import useIsScreenSm from "../../hooks/usIsScreenSm";

const COLORS = ["#7f5539", "#e6ccb2"];

interface GenresRadarChartProps {
    data: Record<string, Record<string, number>>;
}

const GenresRadarChart = ({ data }: GenresRadarChartProps) => {
    const isScreenSm = useIsScreenSm();
    const users = Object.keys(data);

    const allGenres = Array.from(
        new Set(users.flatMap((u) => Object.keys(data[u])))
    );

    const chartData = allGenres.map((genre) => {
        const entry: Record<string, string | number | null> = { genre };
        users.forEach((u) => {
            entry[u] = data[u][genre] ?? null;
        });
        return entry;
    });

    return (
        <div className="w-full flex flex-col">
            <h3 className="w-fit mx-auto text-lg sm:text-xl">
                Genre Preferences
            </h3>
            <ResponsiveContainer width="100%" aspect={1.5}>
                <RadarChart data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis
                        dataKey="genre"
                        tick={
                            isScreenSm
                                ? {
                                      fontSize: 12,
                                      fill: "#000000",
                                  }
                                : {
                                      fontSize: 8,
                                      fill: "#000000",
                                  }
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

                    {users.map((user, i) => (
                        <Radar
                            key={user}
                            name={user}
                            dataKey={user}
                            stroke={COLORS[i % COLORS.length]}
                            fill={COLORS[i % COLORS.length]}
                            fillOpacity={0.25}
                        />
                    ))}
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GenresRadarChart;
