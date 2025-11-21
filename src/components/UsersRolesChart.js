import React, { useState, useEffect } from "react";
import {
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { apiFetch } from "../lib/api";

export default function UsersRolesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/stats/users/roles`)
      .then(res => res.json())
      .then(setData);
  }, []);

  const COLORS = ["#6366f1", "#10b981", "#ef4444"];

  return (
    <div className="chart-card">
      <h3>Users by Role</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="role" outerRadius={120} label>
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
