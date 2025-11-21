import React, { useState, useEffect } from "react";
import {
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { apiFetch } from "../lib/api";

export default function ApplicationsByStatusChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/stats/applications/by-status`)
      .then(res => res.json())
      .then(setData);
  }, []);

  const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6"];

  return (
    <div className="chart-card">
      <h3>Applications by Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie dataKey="count" nameKey="status" data={data} outerRadius={120} label>
            {data.map((entry, i) => (
              <Cell key={entry.status} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
