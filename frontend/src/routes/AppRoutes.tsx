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
</Route>

      </Routes>
    </BrowserRouter>
  );
}