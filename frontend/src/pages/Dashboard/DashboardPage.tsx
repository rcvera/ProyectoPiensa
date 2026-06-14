import {
  Card,
  Col,
  Row,
  Statistic,
  Button,
  Avatar,
} from "antd";

import {
  TeamOutlined,
  ScheduleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import { Pie } from "@ant-design/charts";

import "./Dashboard.css";

export default function DashboardPage() {
  const [stats, setStats] =
    useState<any>({});

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  useEffect(() => {
    axios
      .get(
        "http://localhost:3000/dashboard/stats"
      )
      .then((r) =>
        setStats(r.data)
      )
      .catch((error) =>
        console.log(error)
      );
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const today =
    new Date().toLocaleDateString(
      "es-EC",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

  const data = [
    {
      type: "Empleados",
      value:
        stats.employees || 0,
    },
    {
      type: "Turnos",
      value:
        stats.shifts || 0,
    },
    {
      type: "Marcaciones",
      value:
        stats.attendancesToday || 0,
    },
  ];

  return (
    <div
      style={{
        padding: 30,
      }}
    >
      {/* HEADER */}

      <Row
        justify="space-between"
        align="middle"
        style={{
          marginBottom: 30,
        }}
      >
        <Col>
          <Row
            gutter={16}
            align="middle"
          >
            <Col>
              <Avatar
                size={60}
                icon={<UserOutlined />}
              />
            </Col>

            <Col>
              <h1
                style={{
                  color: "white",
                  margin: 0,
                }}
              >
                AutoWash Control
              </h1>

              <h3
                style={{
                  color: "white",
                  margin: 0,
                }}
              >
                Bienvenido
                {" "}
                {user.name}
              </h3>

              <p
                style={{
                  color: "#d9d9d9",
                  margin: 0,
                }}
              >
                Rol:
                {" "}
                {user.role}
              </p>

              <p
                style={{
                  color: "#d9d9d9",
                  margin: 0,
                }}
              >
                {today}
              </p>
            </Col>
          </Row>
        </Col>

        <Col>
          <Button
            danger
            size="large"
            icon={
              <LogoutOutlined />
            }
            onClick={logout}
          >
            Cerrar Sesión
          </Button>
        </Col>
      </Row>

      {/* ESTADÍSTICAS */}

      <Row gutter={16}>
        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="Empleados"
              value={
                stats.employees || 0
              }
              prefix={
                <TeamOutlined />
              }
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="Turnos"
              value={
                stats.shifts || 0
              }
              prefix={
                <ScheduleOutlined />
              }
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="Marcaciones Hoy"
              value={
                stats.attendancesToday ||
                0
              }
              prefix={
                <UserOutlined />
              }
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="Horas Extras"
              value={
                stats.overtimeHours ||
                0
              }
              prefix={
                <ClockCircleOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* GRÁFICO */}

      <Card
        style={{
          marginTop: 30,
        }}
      >
        <h2>
          Resumen General
        </h2>

        <Pie
          data={data}
          angleField="value"
          colorField="type"
        />
      </Card>
    </div>
  );
}