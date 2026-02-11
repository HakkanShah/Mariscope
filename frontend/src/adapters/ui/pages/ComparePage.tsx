import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const sampleData = [
  { route: 'A', actual: 92.1, target: 89.3368 },
  { route: 'B', actual: 87.4, target: 89.3368 },
  { route: 'C', actual: 95.8, target: 89.3368 },
];

export const ComparePage = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Compare</h2>
        <p className="text-sm text-slate-600">
          Chart infrastructure is scaffolded. Real compliance data wiring follows in adapter integration.
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sampleData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#0e7490" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#334155" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
