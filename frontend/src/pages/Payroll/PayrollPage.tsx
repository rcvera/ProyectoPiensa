import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  DatePicker,
  Modal,
  message,
  Typography,
} from "antd";

import {
  PlayCircleOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";

import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import { api } from "../../services/auth.service";

const { Text } = Typography;

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const money = (v: number) =>
  `$${Number(v ?? 0).toFixed(2)}`;

export default function PayrollPage() {

  const user = getUser();
  const isAdmin = user.role === "ADMIN";

  const [period, setPeriod] = useState<Dayjs>(dayjs());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const month = period.month() + 1;
  const year = period.year();

  const load = async () => {
    try {
      setLoading(true);
      const url = isAdmin ? "/payroll" : "/payroll/mine";
      const res = await api.get(url, { params: { month, year } });
      setData(res.data || []);
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || "No se pudo cargar el rol de pagos",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const totalNet = useMemo(
    () => data.reduce((s, p) => s + (p.netPay || 0), 0),
    [data],
  );

  const onGenerate = () => {
    Modal.confirm({
      title: "Generar rol de pagos",
      icon: <ExclamationCircleFilled />,
      content: `Se calculará el rol de pagos de ${period.format("MMMM YYYY")} para todos los empleados con sueldo base configurado. Si ya existe, se recalculará.`,
      okText: "Sí, generar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setGenerating(true);
          await api.post("/payroll/generate", { month, year });
          message.success("Rol de pagos generado");
          load();
        } catch (e: any) {
          message.error(
            e?.response?.data?.message || "No se pudo generar el rol de pagos",
          );
        } finally {
          setGenerating(false);
        }
      },
    });
  };

  const columns: any[] = [
    ...(isAdmin
      ? [
          {
            title: "Empleado",
            render: (_: any, r: any) => r.user?.name,
          },
        ]
      : []),
    {
      title: "Sueldo Base",
      dataIndex: "baseSalary",
      render: money,
    },
    {
      title: "Extra 50%",
      dataIndex: "overtimeHours50",
      render: (v: number) => `${Number(v ?? 0).toFixed(2)} h`,
    },
    {
      title: "Extra 100%",
      dataIndex: "overtimeHours100",
      render: (v: number) => `${Number(v ?? 0).toFixed(2)} h`,
    },
    {
      title: "Pago H. Extra",
      dataIndex: "overtimePay",
      render: money,
    },
    {
      title: "Ingreso Bruto",
      dataIndex: "grossIncome",
      render: money,
    },
    {
      title: "IESS Personal (9.45%)",
      dataIndex: "iessPersonal",
      render: (v: number) => (
        <Text type="danger">-{money(v)}</Text>
      ),
    },
    {
      title: "Faltas",
      dataIndex: "absenceDays",
      render: (v: number, r: any) =>
        v > 0 ? (
          <Tag color="volcano">
            {v} día(s) · -{money(r.absenceDeduction)}
          </Tag>
        ) : (
          <span style={{ color: "#bbb" }}>—</span>
        ),
    },
    {
      title: "Atrasos",
      dataIndex: "lateMinutes",
      render: (v: number, r: any) =>
        v > 0 ? (
          <Tag color="gold">
            {v} min · -{money(r.lateDeduction)}
          </Tag>
        ) : (
          <span style={{ color: "#bbb" }}>—</span>
        ),
    },
    {
      title: "Líquido a Recibir",
      dataIndex: "netPay",
      render: (v: number) => (
        <Tag color="green" style={{ fontSize: 13, padding: "4px 8px" }}>
          {money(v)}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      title="Rol de Pagos"
      extra={
        <Space>
          <DatePicker
            picker="month"
            value={period}
            allowClear={false}
            onChange={(d) => d && setPeriod(d)}
            format="MMMM YYYY"
          />
          {isAdmin && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={generating}
              onClick={onGenerate}
            >
              Generar rol de pagos
            </Button>
          )}
        </Space>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        scroll={{ x: "max-content" }}
        summary={() =>
          data.length > 0 ? (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={columns.length - 1}>
                <Text strong>Total líquido</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong>{money(totalNet)}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          ) : null
        }
      />
    </Card>
  );
}
