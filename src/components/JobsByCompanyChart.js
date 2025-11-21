import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function JobsByCompanyChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/stats/jobs/by-company`)
      .then(res => res.json())
       .then(data => {
        console.log("Jobs by company:", data);
        setData(data);
      });
  }, []);

  return (
    <div className="chart-card">
      <h3>Jobs by Company</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="company" angle={-20} textAnchor="end" height={70} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
