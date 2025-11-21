import JobsMonthlyChart from "../components/JobsMonthlyChart";
import JobsByCompanyChart from "../components/JobsByCompanyChart";
import JobsByTypeChart from "../components/JobsByTypeChart";
import JobsActiveChart from "../components/JobsActiveChart";

import ApplicationsDailyChart from "../components/ApplicationsDailyChart";
import ApplicationsByStatusChart from "../components/ApplicationsByStatusChart";
import ApplicationsByJobChart from "../components/ApplicationsByJobChart";

import UsersPerMonthChart from "../components/UsersPerMonthChart";
import UsersRolesChart from "../components/UsersRolesChart";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="dashboard-title">Analytics Dashboard</h1>

      <div className="dashboard-grid">
        <JobsMonthlyChart />
        <JobsByCompanyChart />
        <JobsByTypeChart />
        {/* <JobsActiveChart /> */}
        <ApplicationsDailyChart />
        <ApplicationsByStatusChart />
        <ApplicationsByJobChart />
        <UsersPerMonthChart />
        <UsersRolesChart />
      </div>
    </div>
  );
}
