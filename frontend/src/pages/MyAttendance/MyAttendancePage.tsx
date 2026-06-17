import {
  Card,
  Button,
  Space,
  Typography,
  Table,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Steps,
} from "antd";

import {
  LoginOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

import {
  useEffect,
  useState,
} from "react";

import dayjs from "dayjs";

import { api } from "../../services/auth.service";

const { Text, Title } = Typography;

const formatTime = (
  v: string | null,
): string => {
  if (!v) return "—";
  return dayjs(v).format("HH:mm");
};

const formatDateTime = (
  v: string | null,
): string => {
  if (!v) return "—";
  return dayjs(v).format(
    "DD/MM/YYYY HH:mm",
  );
};

const computeWorkedMinutes = (
  checkIn: string,
  breakStart: string | null,
  breakEnd: string | null,
  checkOut: string | null,
  now?: dayjs.Dayjs,
): number => {
  const end = checkOut
    ? dayjs(checkOut)
    : (now || dayjs());
  let total = end.diff(
    dayjs(checkIn),
    "minute",
  );
  if (breakStart && breakEnd) {
    total -= dayjs(breakEnd).diff(
      dayjs(breakStart),
      "minute",
    );
  } else if (breakStart && !breakEnd) {
    total = dayjs(breakStart).diff(
      dayjs(checkIn),
      "minute",
    );
  }
  return Math.max(0, total);
};

const formatDuration = (
  mins: number,
): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

type Stage =
  | "NONE"
  | "WORKING"
  | "ON_BREAK"
  | "BACK_FROM_BREAK"
  | "FINISHED";

const getStage = (
  open: any | null,
): Stage => {
  if (!open) return "NONE";
  if (open.checkOut) return "FINISHED";
  if (
    open.breakStart &&
    !open.breakEnd
  )
    return "ON_BREAK";
  if (
    open.breakStart &&
    open.breakEnd
  )
    return "BACK_FROM_BREAK";
  return "WORKING";
};

export default function MyAttendancePage() {

  const [open, setOpen] =
    useState<any | null>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [now, setNow] =
    useState(dayjs());

  const load = async () => {
    const [openRes, hist] =
      await Promise.all([
        api.get(
          "/attendances/mine/open",
        ),
        api.get("/attendances/mine"),
      ]);
    setOpen(openRes.data || null);
    setHistory(hist.data || []);
  };

  useEffect(() => {
    load();
    const t = setInterval(
      () => setNow(dayjs()),
      30000,
    );
    return () => clearInterval(t);
  }, []);

  const callAction = async (
    path: string,
    successMsg: string,
  ) => {
    try {
      setSubmitting(true);
      await api.post(path, {});
      message.success(successMsg);
      load();
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          "No se pudo registrar",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stage = getStage(open);

  const workedMinutes = open
    ? computeWorkedMinutes(
        open.checkIn,
        open.breakStart,
        open.breakEnd,
        open.checkOut,
        now,
      )
    : 0;

  const stepCurrent =
    stage === "NONE"
      ? 0
      : stage === "WORKING"
        ? 1
        : stage === "ON_BREAK"
          ? 2
          : stage === "BACK_FROM_BREAK"
            ? 3
            : 4;

  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ width: "100%" }}
    >

      <Card>
        <Row
          gutter={[16, 16]}
          align="middle"
        >
          <Col xs={24} md={12}>
            <Title
              level={4}
              style={{ margin: 0 }}
            >
              {stage === "NONE"
                ? "Sin turno activo"
                : stage === "WORKING"
                  ? "Estás trabajando"
                  : stage === "ON_BREAK"
                    ? "Estás en el almuerzo"
                    : "Volviste del almuerzo"}
            </Title>
            <Text type="secondary">
              {dayjs().format(
                "dddd DD/MM/YYYY HH:mm",
              )}
            </Text>
          </Col>

          <Col xs={24} md={12}>
            {open && (
              <Statistic
                title="Tiempo trabajado"
                value={formatDuration(
                  workedMinutes,
                )}
                prefix={
                  <ClockCircleOutlined
                    style={{
                      color:
                        stage ===
                        "ON_BREAK"
                          ? "#fa8c16"
                          : "#52c41a",
                    }}
                  />
                }
              />
            )}
          </Col>
        </Row>

        <div
          style={{ marginTop: 24 }}
        >
          <Steps
            size="small"
            current={stepCurrent}
            items={[
              {
                title: "Entrada",
                description: open
                  ? formatTime(
                      open.checkIn,
                    )
                  : "",
              },
              {
                title: "Almuerzo",
                description:
                  open?.breakStart
                    ? formatTime(
                        open.breakStart,
                      )
                    : "",
              },
              {
                title: "Vuelta",
                description:
                  open?.breakEnd
                    ? formatTime(
                        open.breakEnd,
                      )
                    : "",
              },
              {
                title: "Salida",
                description:
                  open?.checkOut
                    ? formatTime(
                        open.checkOut,
                      )
                    : "",
              },
            ]}
          />
        </div>

        <div
          style={{
            marginTop: 32,
            textAlign: "center",
          }}
        >
          {stage === "NONE" && (
            <Button
              type="primary"
              size="large"
              icon={
                <LoginOutlined />
              }
              loading={submitting}
              onClick={() =>
                callAction(
                  "/attendances/check-in",
                  "Entrada registrada",
                )
              }
              style={{
                height: 60,
                fontSize: 18,
                padding: "0 40px",
              }}
            >
              Marcar Entrada
            </Button>
          )}

          {stage === "WORKING" && (
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={
                  <CoffeeOutlined />
                }
                loading={submitting}
                onClick={() =>
                  callAction(
                    "/attendances/break-start",
                    "Almuerzo iniciado",
                  )
                }
                style={{
                  height: 60,
                  fontSize: 16,
                  padding: "0 24px",
                  background:
                    "#fa8c16",
                  borderColor:
                    "#fa8c16",
                }}
              >
                Salir al almuerzo
              </Button>
              <Button
                danger
                size="large"
                icon={
                  <LogoutOutlined />
                }
                loading={submitting}
                onClick={() =>
                  callAction(
                    "/attendances/check-out",
                    "Salida registrada",
                  )
                }
                style={{
                  height: 60,
                  fontSize: 16,
                  padding: "0 24px",
                }}
              >
                Marcar Salida
              </Button>
            </Space>
          )}

          {stage === "ON_BREAK" && (
            <Button
              type="primary"
              size="large"
              icon={
                <PlayCircleOutlined />
              }
              loading={submitting}
              onClick={() =>
                callAction(
                  "/attendances/break-end",
                  "Volviste del almuerzo",
                )
              }
              style={{
                height: 60,
                fontSize: 18,
                padding: "0 40px",
                background: "#52c41a",
                borderColor: "#52c41a",
              }}
            >
              Volver del almuerzo
            </Button>
          )}

          {stage ===
            "BACK_FROM_BREAK" && (
            <Button
              type="primary"
              danger
              size="large"
              icon={
                <LogoutOutlined />
              }
              loading={submitting}
              onClick={() =>
                callAction(
                  "/attendances/check-out",
                  "Salida registrada",
                )
              }
              style={{
                height: 60,
                fontSize: 18,
                padding: "0 40px",
              }}
            >
              Marcar Salida
            </Button>
          )}
        </div>

      </Card>

      <Card title="Mi historial">
        <Table
          rowKey="id"
          dataSource={history}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: "Entrada",
              dataIndex: "checkIn",
              render: (v: string) =>
                formatDateTime(v),
            },
            {
              title: "Almuerzo",
              dataIndex: "breakStart",
              render: (
                v: string | null,
              ) => formatTime(v),
            },
            {
              title: "Vuelta",
              dataIndex: "breakEnd",
              render: (
                v: string | null,
              ) => formatTime(v),
            },
            {
              title: "Salida",
              dataIndex: "checkOut",
              render: (
                v: string | null,
              ) => formatDateTime(v),
            },
            {
              title: "Trabajado",
              render: (
                _: any,
                r: any,
              ) => {
                if (!r.checkOut) {
                  return (
                    <Tag color="orange">
                      En curso
                    </Tag>
                  );
                }
                return formatDuration(
                  computeWorkedMinutes(
                    r.checkIn,
                    r.breakStart,
                    r.breakEnd,
                    r.checkOut,
                  ),
                );
              },
            },
          ]}
        />
      </Card>

    </Space>
  );
}
