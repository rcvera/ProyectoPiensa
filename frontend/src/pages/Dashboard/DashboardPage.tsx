import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  TeamOutlined,
  ScheduleOutlined,
  WarningOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Column } from "@ant-design/charts";
import { API_URL } from "../../api/config";

import "./Dashboard.css";

const { Title, Text } = Typography;

type IncidentByDay = { day: string; count: number };

type Stats = {
  employees?: number;
  shifts?: number;
  attendancesToday?: number;
  incidents?: number;
  incidentsByDay?: IncidentByDay[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({});

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios
      .get(`${API_URL}/dashboard/stats`)
      .then((r) => setStats(r.data))
      .catch((error) => console.log(error));
  }, []);

  const todayRaw = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

  const pieData = [
    { type: "Empleados", value: stats.employees || 0 },
    { type: "Turnos", value: stats.shifts || 0 },
    { type: "Marcaciones", value: stats.attendancesToday || 0 },
  ];

  const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const incidentsByDay = (stats.incidentsByDay ?? []).map((d) => {
    const [y, m, day] = d.day.split("-").map(Number);
    const date = new Date(y, m - 1, day);
    return { label: WEEKDAYS[date.getDay()], count: d.count };
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title level={2} style={{ margin: 0 }}>
          Hola, {user.name || "Usuario"}
        </Title>
        <Text type="secondary">{today}</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Empleados"
              value={stats.employees || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Turnos"
              value={stats.shifts || 0}
              prefix={<ScheduleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Marcaciones Hoy"
              value={stats.attendancesToday || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Incidentes Reportados"
              value={stats.incidents || 0}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card className="dashboard-chart" title="Resumen General">
            <div style={{ height: 340 }}>
              <Pie
                data={pieData}
                angleField="value"
                colorField="type"
                radius={0.9}
                innerRadius={0.6}
                legend={{
                  position: "right",
                  itemName: {
                    formatter: (text: string) => {
                      const item = pieData.find((d) => d.type === text);
                      return `${text}  ·  ${item?.value ?? 0}`;
                    },
                  },
                }}
                label={{
                  text: (d: { value: number }) => {
                    const total = pieData.reduce((sum, item) => sum + item.value, 0);
                    return total ? `${((d.value / total) * 100).toFixed(0)}%` : "";
                  },
                  style: { fontWeight: 600, fill: "#fff", fontSize: 13 },
                  position: "inside",
                }}
                statistic={{
                  title: { content: "Total", style: { fontSize: 14, color: "#8c8c8c" } },
                  content: {
                    content: String(pieData.reduce((sum, item) => sum + item.value, 0)),
                    style: { fontSize: 28, fontWeight: 600, color: "#1f1f1f" },
                  },
                }}
                interactions={[{ type: "element-active" }]}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            className="dashboard-chart"
            title="Incidentes de la semana"
          >
            <div style={{ height: 340 }}>
              <Column
                data={incidentsByDay}
                xField="label"
                yField="count"
                style={{ fill: "#ff4d4f", radiusTopLeft: 4, radiusTopRight: 4 }}
                columnWidthRatio={0.55}
                label={{
                  text: "count",
                  position: "top",
                  style: { fontWeight: 600, fill: "#1f1f1f" },
                }}
                yAxis={{
                  tickInterval: 1,
                  label: { formatter: (v: string) => v },
                }}
                xAxis={{
                  label: { autoRotate: false },
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
