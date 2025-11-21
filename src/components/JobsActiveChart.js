import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function JobsActiveChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/stats/jobs/active`)
      .then(res => res.json())
      .then(res => setData([
        { name: "Active", value: res.active },
        { name: "Inactive", value: res.inactive }
      ]));
  }, []);

  return (
    <div className="chart-card">
      <h3>Active vs Inactive Jobs</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            <Cell fill="#10b981" />
            <Cell fill="#ef4444" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
