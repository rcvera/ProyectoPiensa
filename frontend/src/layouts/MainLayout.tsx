import {
  Layout,
  Menu,
} from "antd";

import {
  UserOutlined,
  TeamOutlined,
  ScheduleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

import { Outlet } from "react-router-dom";

const { Sider, Content } = Layout;

export default function MainLayout() {

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

        <Menu
          theme="dark"
          mode="inline"
          items={[
            {
              key: "1",
              icon: <UserOutlined />,
              label: "Dashboard",
            },
            {
              key: "2",
              icon: <TeamOutlined />,
              label: "Empleados",
            },
            {
              key: "3",
              icon: <ScheduleOutlined />,
              label: "Turnos",
            },
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
            key:"/overtimes",
            icon:<ClockCircleOutlined />,
            label:"Horas Extras",
            },
            {
            key: "/dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            },
          ]}
        />
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