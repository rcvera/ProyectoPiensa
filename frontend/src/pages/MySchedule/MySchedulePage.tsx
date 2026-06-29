import {
  Card,
  Button,
  Space,
  Typography,
  Empty,
  Tag,
  Row,
  Col,
  Spin,
} from "antd";

import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/auth.service";

import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import utc from "dayjs/plugin/utc";

dayjs.extend(isoWeek);
dayjs.extend(utc);

const { Text, Title } = Typography;

const DAY_LABELS = [
  "Lunes", "Martes", "Miércoles", "Jueves",
  "Viernes", "Sábado", "Domingo",
];

const startOfWeek = (d: Dayjs): Dayjs =>
  d.startOf("isoWeek").startOf("day");

export default function MySchedulePage() {

  const [weekStart, setWeekStart] = useState<Dayjs>(startOfWeek(dayjs()));
  const [assignments, setAssignments] = useState<any[]>([]);
  const [summary, setSummary] = useState({ workedHours: 0, overtimeHours: 0 });
  const [loading, setLoading] = useState(false);

  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => weekStart.add(i, "day")),
    [weekStart],
  );

  const weekEnd = useMemo(() => weekStart.add(6, "day"), [weekStart]);

  const load = async () => {
    try {
      setLoading(true);
      const from = weekStart.format("YYYY-MM-DD");
      const to = weekEnd.format("YYYY-MM-DD");

      const [assignRes, summaryRes] = await Promise.all([
        api.get("/assignments/mine", { params: { from, to } }),
        api.get("/overtimes/mine/summary", { params: { from, to } }),
      ]);

      setAssignments(assignRes.data || []);
      setSummary(summaryRes.data || { workedHours: 0, overtimeHours: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [weekStart]);

  const getCell = (date: Dayjs) => {
    const dateStr = date.format("YYYY-MM-DD");
    return assignments.find(
      (a) => dayjs.utc(a.date).format("YYYY-MM-DD") === dateStr,
    );
  };

  return (
    <Card
      title={
        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={() => setWeekStart(weekStart.subtract(7, "day"))}
          />
          <Button
            icon={<CalendarOutlined />}
            onClick={() => setWeekStart(startOfWeek(dayjs()))}
          >
            Esta semana
          </Button>
          <Button
            icon={<RightOutlined />}
            onClick={() => setWeekStart(weekStart.add(7, "day"))}
          />
          <Title level={5} style={{ margin: 0 }}>
            Mi Horario · {weekStart.format("DD/MM")} al{" "}
            {weekEnd.format("DD/MM/YYYY")}
          </Title>
        </Space>
      }
      extra={
        <Space size="large">
          <Text type="secondary">
            Trabajadas:{" "}
            <Text strong style={{ color: "#52c41a" }}>
              {summary.workedHours.toFixed(1)} h
            </Text>
          </Text>
          <Text type="secondary">
            Extras:{" "}
            <Text strong style={{ color: summary.overtimeHours > 0 ? "#fa8c16" : "#aaa" }}>
              {summary.overtimeHours.toFixed(1)} h
            </Text>
          </Text>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {assignments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No tenés turnos publicados en esta semana"
          />
        ) : (
          <Row gutter={[12, 12]}>
            {days.map((d, idx) => {
              const cell = getCell(d);
              const isToday = d.isSame(dayjs(), "day");
              return (
                <Col
                  xs={24} sm={12} md={8} lg={6} xl={24 / 7}
                  key={d.format("YYYY-MM-DD")}
                >
                  <Card
                    size="small"
                    style={{
                      borderColor: isToday ? "#1677ff" : undefined,
                      borderWidth: isToday ? 2 : 1,
                      minHeight: 130,
                    }}
                  >
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                      <Text strong>{DAY_LABELS[idx]}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {d.format("DD/MM")}
                      </Text>
                    </div>

                    {cell ? (
                      <div style={{ textAlign: "center" }}>
                        <Tag
                          color={cell.shift.startTime ? "blue" : "default"}
                          style={{ margin: 0, fontSize: 13, padding: "4px 8px" }}
                        >
                          {cell.shift.name}
                        </Tag>
                        {cell.shift.startTime && cell.shift.endTime ? (
                          <div style={{ marginTop: 8, fontSize: 13 }}>
                            <ClockCircleOutlined />{" "}
                            {cell.shift.startTime} - {cell.shift.endTime}
                          </div>
                        ) : (
                          <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                            Día libre
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", color: "#bbb", marginTop: 16 }}>
                        Libre
                      </div>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Spin>
    </Card>
  );
}
