import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Tooltip,
} from "antd";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { api } from "../../services/auth.service";

import justificationsService
  from "../../services/justifications.service";

import {
  JUSTIFICATION_STATUS,
  JUSTIFICATION_TYPES,
  getStatusMeta,
  getTypeLabel,
} from "../../constants/justifications";

const { RangePicker } = DatePicker;

const truncate = (
  text: string,
  max = 60,
) =>
  text && text.length > max
    ? text.slice(0, max) + "…"
    : text;

const formatDate = (
  value: string,
) => {

  if (!value) return "";

  return new Date(value)
    .toLocaleDateString();
};

export default function JustificationsList() {

  const navigate = useNavigate();

  const [data, setData] =
    useState<any[]>([]);

  const [users, setUsers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [filters, setFilters] =
    useState<any>({});

  const load = async () => {

    try {

      setLoading(true);

      const params: any = {};

      if (filters.userId)
        params.userId = filters.userId;

      if (filters.type)
        params.type = filters.type;

      if (filters.status)
        params.status = filters.status;

      if (filters.range?.length === 2) {
        params.from = filters.range[0]
          .format("YYYY-MM-DD");
        params.to = filters.range[1]
          .format("YYYY-MM-DD");
      }

      const result =
        await justificationsService.list(
          params,
        );

      setData(result || []);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    api
      .get("/users")
      .then((r) =>
        setUsers(r.data || []),
      )
      .catch(() => setUsers([]));

  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const columns = [
    {
      title: "Día de la falta",
      dataIndex: "date",
      render: (v: string) =>
        formatDate(v),
    },
    {
      title: "Empleado",
      render: (_: any, r: any) =>
        r.user?.name || "—",
    },
    {
      title: "Motivo",
      dataIndex: "type",
      render: (v: string) => (
        <Tag color="geekblue">
          {getTypeLabel(v)}
        </Tag>
      ),
    },
    {
      title: "Descripción",
      dataIndex: "description",
      render: (v: string) => (
        <Tooltip title={v}>
          {truncate(v)}
        </Tooltip>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      render: (v: string) => {
        const meta = getStatusMeta(v);
        return (
          <Tag color={meta.color}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: "Acciones",
      render: (_: any, r: any) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(
              `/justifications/${r.id}`,
            )
          }
        >
          Revisar
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="Justificaciones de Falta"
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={load}
        >
          Refrescar
        </Button>
      }
    >

      <Row
        gutter={12}
        style={{ marginBottom: 16 }}
      >

        <Col>
          <Select
            allowClear
            style={{ width: 200 }}
            placeholder="Empleado"
            value={filters.userId}
            onChange={(v) =>
              setFilters({
                ...filters,
                userId: v,
              })
            }
            options={users.map(
              (u: any) => ({
                value: u.id,
                label: u.name,
              }),
            )}
          />
        </Col>

        <Col>
          <Select
            allowClear
            style={{ width: 200 }}
            placeholder="Motivo"
            value={filters.type}
            onChange={(v) =>
              setFilters({
                ...filters,
                type: v,
              })
            }
            options={JUSTIFICATION_TYPES}
          />
        </Col>

        <Col>
          <Select
            allowClear
            style={{ width: 160 }}
            placeholder="Estado"
            value={filters.status}
            onChange={(v) =>
              setFilters({
                ...filters,
                status: v,
              })
            }
            options={JUSTIFICATION_STATUS.map(
              (s) => ({
                value: s.value,
                label: s.label,
              }),
            )}
          />
        </Col>

        <Col>
          <RangePicker
            onChange={(v) =>
              setFilters({
                ...filters,
                range: v,
              })
            }
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
