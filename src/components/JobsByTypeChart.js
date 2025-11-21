import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export default function JobsByTypeChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/stats/jobs/by-type`)
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="chart-card">
      <h3>Jobs by Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie dataKey="count"   nameKey="type" data={data} outerRadius={130} label>
            {data.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
