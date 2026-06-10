import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Button,
} from "antd";

import {
  LogoutOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import "./Dashboard.css";

const { Header, Content } = Layout;

export default function DashboardPage() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <Layout className="dashboard-container">
      <Header className="dashboard-header">
        <h2 style={{ color: "#001529" }}>
          AutoWash Control
        </h2>

        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={logout}
        >
          Salir
        </Button>
      </Header>

      <Content className="dashboard-content">
        <Card className="welcome-card">
          <h2>
            Bienvenido {user.name}
          </h2>

          <p>
            Rol: {user.role}
          </p>
        </Card>

        <br />

        <Row gutter={16}>
          <Col span={8}>
            <Card className="stats-card">
              <Statistic
                title="Empleados"
                value={0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card className="stats-card">
              <Statistic
                title="Turnos Activos"
                value={0}
                prefix={
                  <ClockCircleOutlined />
                }
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card className="stats-card">
              <Statistic
                title="Horas Extras"
                value={0}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}