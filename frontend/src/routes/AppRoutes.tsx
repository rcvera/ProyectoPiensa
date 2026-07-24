import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LoginPage from "../pages/Login/LoginPage";

import DashboardPage from "../pages/Dashboard/DashboardPage";

import PrivateRoute from "./PrivateRoute";
import EmployeesPage from "../pages/Employees/EmployeesPage";
import MainLayout from "../layouts/MainLayout";
import ShiftsPage from "../pages/Shifts/ShiftsPage";
import AssignmentsPage from "../pages/Assignments/AssignmentsPage";
import AttendancesPage from "../pages/Attendances/AttendancesPage";
import OvertimesPage from "../pages/Overtimes/OvertimesPage";
import ReportsPage from "../pages/Reports/ReportsPage";
import CreateIncident from "../pages/Incidents/CreateIncident";
import MyIncidents from "../pages/Incidents/MyIncidents";
import IncidentsList from "../pages/Incidents/IncidentsList";
import IncidentDetail from "../pages/Incidents/IncidentDetail";
import CreateJustification from "../pages/Justifications/CreateJustification";
import MyJustifications from "../pages/Justifications/MyJustifications";
import JustificationsList from "../pages/Justifications/JustificationsList";
import JustificationDetail from "../pages/Justifications/JustificationDetail";
import MySchedulePage from "../pages/MySchedule/MySchedulePage";
import MyAttendancePage from "../pages/MyAttendance/MyAttendancePage";
import PositionsPage from "../pages/Positions/PositionsPage";
import PayrollPage from "../pages/Payroll/PayrollPage";
import MyWorkloadSurveys from "../pages/WorkloadSurveys/MyWorkloadSurveys";
import WorkloadSurveysList from "../pages/WorkloadSurveys/WorkloadSurveysList";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<LoginPage />}
        />

        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />
          <Route
            path="/employees"
            element={<EmployeesPage />}
          />
          <Route
            path="/shifts"
            element={<ShiftsPage />}
          />
          <Route
            path="/assignments"
            element={<AssignmentsPage />}
          />
          <Route
            path="/attendances"
            element={<AttendancesPage />}
          />
          <Route
            path="/overtimes"
            element={<OvertimesPage />}
          />
          <Route
            path="/reports"
            element={<ReportsPage />}
          />
          <Route
            path="/incidents"
            element={<IncidentsList />}
          />
          <Route
            path="/incidents/new"
            element={<CreateIncident />}
          />
          <Route
            path="/incidents/mine"
            element={<MyIncidents />}
          />
          <Route
            path="/incidents/:id"
            element={<IncidentDetail />}
          />
          <Route
            path="/justifications"
            element={<JustificationsList />}
          />
          <Route
            path="/justifications/new"
            element={<CreateJustification />}
          />
          <Route
            path="/justifications/mine"
            element={<MyJustifications />}
          />
          <Route
            path="/justifications/:id"
            element={<JustificationDetail />}
          />
          <Route
            path="/my-schedule"
            element={<MySchedulePage />}
          />
          <Route
            path="/my-attendance"
            element={
              <MyAttendancePage />
            }
          />
          <Route
            path="/positions"
            element={<PositionsPage />}
          />
          <Route
            path="/payroll"
            element={<PayrollPage />}
          />
          <Route
            path="/workload-surveys"
            element={<WorkloadSurveysList />}
          />
          <Route
            path="/workload-surveys/mine"
            element={<MyWorkloadSurveys />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
