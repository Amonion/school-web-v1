import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Math", John: 85, Jane: 92, Mike: 75 },
  { name: "English", John: 78, Jane: 88, Mike: 80 },
  { name: "Science", John: 90, Jane: 95, Mike: 85 },
];

export default function GroupedBarChart() {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-center mb-4">
        Users Monthly Registration
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="John" fill="#8884d8" />
          <Bar dataKey="Jane" fill="#82ca9d" />
          <Bar dataKey="Mike" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
