import {
  Card,
  Table,
  Tag,
  Button,
  Tooltip,
  Empty,
} from "antd";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import incidentsService
  from "../../services/incidents.service";

import {
  getStatusMeta,
  getTypeLabel,
} from "../../constants/incidents";

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

  const d = new Date(value);

  return d.toLocaleString();
};

export default function MyIncidents() {

  const navigate = useNavigate();

  const [data, setData] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const load = async () => {

    try {

      setLoading(true);

      const result =
        await incidentsService
          .listMine();

      setData(result || []);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    {
      title: "Fecha",
      dataIndex: "createdAt",
      render: (v: string) =>
        formatDate(v),
    },
    {
      title: "Tipo",
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
      title: "Respuesta",
      dataIndex: "adminResponse",
      render: (v: string) =>
        v ? (
          <Tooltip title={v}>
            {truncate(v, 40)}
          </Tooltip>
        ) : (
          <span
            style={{ color: "#999" }}
          >
            —
          </span>
        ),
    },
    {
      title: "Acciones",
      render: (_: any, r: any) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(
              `/incidents/${r.id}`,
            )
          }
        >
          Ver detalle
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="Mis Incidentes"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            navigate(
              "/incidents/new",
            )
          }
        >
          Reportar incidente
        </Button>
      }
    >

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        locale={{
          emptyText: (
            <Empty
              description="Sin incidentes reportados"
            />
          ),
        }}
      />

    </Card>
  );
}
