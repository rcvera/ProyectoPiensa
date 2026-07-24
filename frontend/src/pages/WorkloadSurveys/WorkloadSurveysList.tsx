import {
  Card,
  Table,
  Tag,
  Select,
  Row,
  Col,
  Tooltip,
  Button,
} from "antd";

import {
  useEffect,
  useState,
} from "react";

import {
  ReloadOutlined,
} from "@ant-design/icons";

import workloadSurveysService
  from "../../services/workloadSurveys.service";

import {
  MONTH_NAMES,
  formatMonthYear,
  getSurveyStatus,
} from "../../constants/workloadSurveys";

const truncate = (
  text: string,
  max = 60,
) =>
  text && text.length > max
    ? text.slice(0, max) + "…"
    : text;

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: 5 },
  (_, i) => currentYear - i,
).map((y) => ({ value: y, label: String(y) }));

const MONTH_OPTIONS = MONTH_NAMES.map((label, i) => ({
  value: i + 1,
  label,
}));

export default function WorkloadSurveysList() {

  const [data, setData] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [filters, setFilters] =
    useState<any>({});

  const load = async () => {
    try {
      setLoading(true);
      const result =
        await workloadSurveysService.listAll(filters);
      setData(result || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const columns = [
    {
      title: "Empleado",
      render: (_: any, r: any) => r.user?.name || "—",
    },
    {
      title: "Periodo",
      render: (_: any, r: any) =>
        formatMonthYear(r.month, r.year),
    },
    {
      title: "Estado",
      render: (_: any, r: any) => {
        const meta = getSurveyStatus(r.completedAt);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "Horas",
      dataIndex: "hoursFeeling",
      render: (v: number) => v ?? "—",
    },
    {
      title: "Carga física",
      dataIndex: "physicalLoad",
      render: (v: number) => v ?? "—",
    },
    {
      title: "Carga emocional",
      dataIndex: "emotionalLoad",
      render: (v: number) => v ?? "—",
    },
    {
      title: "Comentarios",
      dataIndex: "comments",
      render: (v: string) =>
        v ? (
          <Tooltip title={v}>{truncate(v, 40)}</Tooltip>
        ) : (
          <span style={{ color: "#999" }}>—</span>
        ),
    },
  ];

  return (
    <Card
      title="Encuestas de Carga Laboral"
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={load}
        >
          Refrescar
        </Button>
      }
    >

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            allowClear
            style={{ width: 160 }}
            placeholder="Mes"
            value={filters.month}
            onChange={(v) =>
              setFilters({ ...filters, month: v })
            }
            options={MONTH_OPTIONS}
          />
        </Col>
        <Col>
          <Select
            allowClear
            style={{ width: 120 }}
            placeholder="Año"
            value={filters.year}
            onChange={(v) =>
              setFilters({ ...filters, year: v })
            }
            options={YEAR_OPTIONS}
          />
        </Col>
      </Row>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
      />

    </Card>
  );
}
