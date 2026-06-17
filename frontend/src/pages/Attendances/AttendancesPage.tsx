import {
  Card,
  Select,
  Table,
  DatePicker,
  Space,
  Tag,
  Button,
  Typography,
} from "antd";

import {
  ReloadOutlined,
} from "@ant-design/icons";

import {
  useEffect,
  useState,
} from "react";

import dayjs, { Dayjs } from "dayjs";

import { api } from "../../services/auth.service";

import "./AttendancesPage.css";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const formatDateTime = (
  v: string | null,
): string => {
  if (!v) return "—";
  return dayjs(v).format(
    "DD/MM/YYYY HH:mm",
  );
};

const formatTime = (
  v: string | null,
): string => {
  if (!v) return "—";
  return dayjs(v).format("HH:mm");
};

const computeDuration = (
  checkIn: string,
  breakStart: string | null,
  breakEnd: string | null,
  checkOut: string | null,
): string => {
  if (!checkOut) return "En curso";
  let mins = dayjs(checkOut).diff(
    dayjs(checkIn),
    "minute",
  );
  if (breakStart && breakEnd) {
    mins -= dayjs(breakEnd).diff(
      dayjs(breakStart),
      "minute",
    );
  }
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

export default function AttendancesPage() {

  const [users, setUsers] =
    useState<any[]>([]);

  const [userId, setUserId] =
    useState<string | undefined>();

  const [range, setRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const [data, setData] = useState<
    any[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (userId)
        params.userId = userId;
      if (range?.[0])
        params.from =
          range[0].format("YYYY-MM-DD");
      if (range?.[1])
        params.to =
          range[1].format("YYYY-MM-DD");
      const r = await api.get(
        "/attendances",
        { params },
      );
      setData(r.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get("/users")
      .then((r) =>
        setUsers(r.data || []),
      );
  }, []);

  useEffect(() => {
    load();
  }, [userId, range]);

  return (
    <Card
      title="Marcaciones de empleados"
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={load}
        >
          Actualizar
        </Button>
      }
    >

      <Space
        style={{ marginBottom: 16 }}
        wrap
      >
        <Select
          allowClear
          placeholder="Filtrar por empleado"
          style={{ width: 260 }}
          value={userId}
          onChange={(v) =>
            setUserId(v)
          }
          options={users.map(
            (u: any) => ({
              label: u.name,
              value: u.id,
            }),
          )}
        />

        <RangePicker
          format="DD/MM/YYYY"
          value={range as any}
          onChange={(v) =>
            setRange(v as any)
          }
        />

        {(userId || range) && (
          <Button
            onClick={() => {
              setUserId(undefined);
              setRange(null);
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          {
            title: "Empleado",
            render: (
              _: any,
              r: any,
            ) => (
              <div>
                <div
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {r.user.name}
                </div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  {r.user.position ||
                    r.user.email}
                </Text>
              </div>
            ),
          },
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
              const d = computeDuration(
                r.checkIn,
                r.breakStart,
                r.breakEnd,
                r.checkOut,
              );
              return r.checkOut ? (
                <Text>{d}</Text>
              ) : (
                <Tag color="orange">
                  {d}
                </Tag>
              );
            },
          },
        ]}
      />

    </Card>
  );
}
