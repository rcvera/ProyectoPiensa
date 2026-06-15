import {
  Layout,
  Menu,
} from "antd";
import type { MenuProps } from "antd";

import {
  UserOutlined,
  TeamOutlined,
  ScheduleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import { Outlet } from "react-router-dom";

const user: any = JSON.parse(localStorage.getItem("user") || "{}");

const { Sider, Content } = Layout;

export default function MainLayout() {

  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    ...(user.role === "ADMIN"
      ? [
          {
            key: "/employees",
            icon: <TeamOutlined />,
            label: "Empleados",
          },
          {
            key: "/reports",
            icon: <FileTextOutlined />,
            label: "Reportes",
          },
        ]
      : []),
    {
      key: "/shifts",
      icon: <ScheduleOutlined />,
      label: "Turnos",
    },
    {
      key: "/assignments",
      icon: <ScheduleOutlined />,
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
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>

        <div
          style={{
            color: "white",
            padding: 20,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          AutoWash
        </div>

        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>

      <Content
        style={{
          padding: 24,
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}