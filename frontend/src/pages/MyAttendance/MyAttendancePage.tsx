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
} from "antd";

import {
  LoginOutlined,
  LogoutOutlined,
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

  const user = JSON.parse(
    localStorage.getItem("user") || "{}",
  );

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
      1000,
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

  const stageLabel = {
    NONE: "Sin turno activo",
    WORKING: "Estás trabajando",
    ON_BREAK: "Estás en el almuerzo",
    BACK_FROM_BREAK: "Volviste del almuerzo",
    FINISHED: "Jornada finalizada",
  }[stage];

  const todayLabel = (() => {
    const raw = now.toDate().toLocaleDateString("es-EC", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ width: "100%" }}
    >

      <Card>
        <div style={{ textAlign: "center" }}>
          <Title level={3} style={{ margin: 0 }}>
            Hola, {user.name || "Colaborador"}
          </Title>
          <Text type="secondary">
            {stageLabel} · {todayLabel}
          </Text>
        </div>

        <div
          style={{
            textAlign: "center",
            margin: "28px 0",
          }}
        >
          <Text
            type="secondary"
            style={{ letterSpacing: 2, fontSize: 12 }}
          >
            HORA ACTUAL
          </Text>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontFamily:
                "'Courier New', monospace",
              lineHeight: 1.1,
            }}
          >
            {now.format("HH:mm:ss")}
          </div>
          {open && (
            <Text type="secondary">
              Tiempo trabajado: {formatDuration(workedMinutes)}
            </Text>
          )}
        </div>

        {open && (
          <Row
            justify="center"
            gutter={[8, 8]}
            style={{ marginBottom: 24 }}
          >
            <Col>
              <Tag color="blue">
                Entrada {formatTime(open.checkIn)}
              </Tag>
            </Col>
            {open.breakStart && (
              <Col>
                <Tag color="orange">
                  Almuerzo {formatTime(open.breakStart)}
                </Tag>
              </Col>
            )}
            {open.breakEnd && (
              <Col>
                <Tag color="green">
                  Regreso {formatTime(open.breakEnd)}
                </Tag>
              </Col>
            )}
          </Row>
        )}

        <Space
          direction="vertical"
          size="middle"
          style={{
            width: "100%",
            maxWidth: 420,
            margin: "0 auto",
            display: "flex",
          }}
        >
          {stage === "NONE" && (
            <Button
              type="primary"
              block
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
              }}
            >
              Marcar Entrada
            </Button>
          )}

          {stage === "WORKING" && (
            <>
              <Button
                danger
                type="primary"
                block
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
                }}
              >
                Finalizar Jornada
              </Button>
              <Button
                block
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
                  height: 56,
                  fontSize: 16,
                  background:
                    "#fa8c16",
                  borderColor:
                    "#fa8c16",
                  color: "#fff",
                }}
              >
                Inicio Almuerzo
              </Button>
            </>
          )}

          {stage === "ON_BREAK" && (
            <Button
              type="primary"
              block
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
                background: "#52c41a",
                borderColor: "#52c41a",
              }}
            >
              Volver del Almuerzo
            </Button>
          )}

          {stage ===
            "BACK_FROM_BREAK" && (
            <Button
              type="primary"
              danger
              block
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
              }}
            >
              Finalizar Jornada
            </Button>
          )}
        </Space>

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
              title: "Regreso del almuerzo",
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
