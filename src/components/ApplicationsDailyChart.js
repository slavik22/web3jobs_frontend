import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
    LineChart,
    Line
} from "recharts";
import { apiFetch } from "../lib/api";


export default function ApplicationsDailyChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/stats/applications/daily`)
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="chart-card">
      <h3>Applications Per Day</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
