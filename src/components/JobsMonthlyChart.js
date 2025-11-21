import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";


export default function JobsMonthlyChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/stats/jobs/monthly`)
      .then(res => res.json())
      .then(data => {
        console.log("Jobs monthly:", data);
        setData(data);
      });
  }, []);

  return (
    <div className="chart-card">
       <h3>Jobs Created Per Month</h3>

        <ResponsiveContainer width= "100%" height={300} >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
     </div>
  );
}
