import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Tag,
} from "antd";
import type { MenuProps } from "antd";

import {
  TeamOutlined,
  ScheduleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  LockOutlined,
  DollarOutlined,
  FileProtectOutlined,
  SmileOutlined,
} from "@ant-design/icons";

import {
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useState } from "react";
import NotificationsBell from "./NotificationsBell";
import ChangePasswordModal from "../components/ChangePasswordModal";

const { Text } = Typography;
const { Sider, Content, Header } = Layout;

const ROLE_META: Record<
  string,
  { label: string; color: string }
> = {
  ADMIN: {
    label: "Administrador",
    color: "purple",
  },
  SUPERVISOR: {
    label: "Supervisor",
    color: "blue",
  },
  EMPLOYEE: {
    label: "Empleado",
    color: "default",
  },
};

const getUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
        "{}",
    );
  } catch {
    return {};
  }
};

export default function MainLayout() {

  const navigate = useNavigate();
  const location = useLocation();

  const [changePwdOpen, setChangePwdOpen] = useState(false);

  const user = getUser();

  const role = user.role || "EMPLOYEE";

  const isAdmin = role === "ADMIN";
  const isSupervisor =
    role === "SUPERVISOR";

  const adminItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/employees",
      icon: <TeamOutlined />,
      label: "Empleados",
    },
    {
      key: "/positions",
      icon: <ApartmentOutlined />,
      label: "Cargos",
    },
    {
      key: "/shifts",
      icon: <ScheduleOutlined />,
      label: "Turnos",
    },
    {
      key: "/assignments",
      icon: <CalendarOutlined />,
      label: "Asignaciones",
    },
    {
      key: "/attendances",
      icon: <ClockCircleOutlined />,
      label: "Marcaciones",
    },
    {
      key: "/overtimes",
      icon: <ClockCircleOutlined />,
      label: "Horas Extras",
    },
    {
      key: "/incidents",
      icon: <WarningOutlined />,
      label: "Incidentes",
    },
    {
      key: "/justifications",
      icon: <FileProtectOutlined />,
      label: "Justificaciones",
    },
    {
      key: "/payroll",
      icon: <DollarOutlined />,
      label: "Rol de Pagos",
    },
    {
      key: "/workload-surveys",
      icon: <SmileOutlined />,
      label: "Carga Laboral",
    },
    {
      key: "/reports",
      icon: <FileTextOutlined />,
      label: "Reportes",
    },
  ];

  const supervisorItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/assignments",
      icon: <CalendarOutlined />,
      label: "Asignaciones",
    },
    {
      key: "/attendances",
      icon: <ClockCircleOutlined />,
      label: "Marcaciones",
    },
    {
      key: "/overtimes",
      icon: <ClockCircleOutlined />,
      label: "Horas Extras",
    },
    {
      key: "/incidents",
      icon: <WarningOutlined />,
      label: "Incidentes",
    },
    {
      key: "/justifications",
      icon: <FileProtectOutlined />,
      label: "Justificaciones",
    },
  ];

  const employeeItems = [
    {
      key: "/my-schedule",
      icon: <CalendarOutlined />,
      label: "Mi Horario",
    },
    {
      key: "/my-attendance",
      icon: <ClockCircleOutlined />,
      label: "Fichar Entrada/Salida",
    },
    {
      key: "/incidents/new",
      icon:
        <ExclamationCircleOutlined />,
      label: "Reportar Incidente",
    },
    {
      key: "/incidents/mine",
      icon: <WarningOutlined />,
      label: "Mis Incidentes",
    },
    {
      key: "/justifications/new",
      icon: <FileProtectOutlined />,
      label: "Justificar Falta",
    },
    {
      key: "/justifications/mine",
      icon: <FileProtectOutlined />,
      label: "Mis Justificaciones",
    },
    {
      key: "/payroll",
      icon: <DollarOutlined />,
      label: "Mi Rol de Pagos",
    },
    {
      key: "/workload-surveys/mine",
      icon: <SmileOutlined />,
      label: "Mi Carga Laboral",
    },
  ];

  const menuItems: MenuProps["items"] =
    isAdmin
      ? adminItems
      : isSupervisor
        ? supervisorItems
        : employeeItems;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const userMenu: MenuProps["items"] = [
    {
      key: "info",
      label: (
        <div
          style={{
            padding: "4px 0",
          }}
        >
          <div
            style={{
              fontWeight: 600,
            }}
          >
            {user.name || "Usuario"}
          </div>
          <Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            {user.email}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: "Cambiar contraseña",
      onClick: () => setChangePwdOpen(true),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar sesión",
      onClick: logout,
    },
  ];

  const roleMeta =
    ROLE_META[role] || ROLE_META.EMPLOYEE;

  return (
    <Layout
      style={{ minHeight: "100vh" }}
    >
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
      >

        <div
          style={{
            color: "white",
            padding: 20,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          AutoWash
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={[
            location.pathname,
          ]}
          onClick={(e) =>
            navigate(e.key)
          }
        />
      </Sider>

      <Layout>

        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <Tag
            color={roleMeta.color}
            style={{
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {roleMeta.label}
          </Tag>

          <Space size="large">

            <NotificationsBell />

            <Dropdown
              menu={{ items: userMenu }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Space
                style={{
                  cursor: "pointer",
                }}
              >
                <Avatar
                  size="small"
                  icon={
                    <UserOutlined />
                  }
                  style={{
                    background:
                      "#1677ff",
                  }}
                />
                <Text strong>
                  {user.name ||
                    "Usuario"}
                </Text>
              </Space>
            </Dropdown>

          </Space>

        </Header>

        <Content
          style={{
            padding: 24,
            background: "#eef2f7",
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      <ChangePasswordModal
        open={changePwdOpen}
        onClose={() => setChangePwdOpen(false)}
      />
    </Layout>
  );
}
