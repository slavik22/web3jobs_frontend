import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { apiFetch } from "../lib/api";


export default function UsersPerMonthChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/stats/users/monthly`)
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="chart-card">
      <h3>Users Registered Per Month</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
