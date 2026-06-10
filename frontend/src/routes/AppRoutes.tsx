import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import EmployeesPage from "../pages/Employees/EmployeesPage";
import MainLayout from "../layouts/MainLayout";

function DashboardPage() {
  return <div>Dashboard</div>;
}

type PrivateRouteProps = {
  children: React.ReactNode;
};

function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = Boolean(localStorage.getItem("token"));
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

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