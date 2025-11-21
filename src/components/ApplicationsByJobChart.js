import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { apiFetch } from "../lib/api";


export default function ApplicationsByJobChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/stats/applications/by-job`)
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="chart-card">
      <h3>Top Applications by Job</h3>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart layout="vertical" data={data.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="job" width={200} />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
