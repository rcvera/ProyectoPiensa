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

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<LoginPage />}
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
  element={
    <PrivateRoute>
      <MainLayout />
    </PrivateRoute>
  }
>
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
</Route>

      </Routes>
    </BrowserRouter>
  );
}