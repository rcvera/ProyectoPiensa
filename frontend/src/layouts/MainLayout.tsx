import {
  Layout,
  Menu,
} from "antd";

import {
  UserOutlined,
  TeamOutlined,
  ScheduleOutlined,
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