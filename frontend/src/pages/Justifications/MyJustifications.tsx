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

import justificationsService
  from "../../services/justifications.service";

import {
  getStatusMeta,
  getTypeLabel,
} from "../../constants/justifications";

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

export default function MyJustifications() {

  const navigate = useNavigate();

  const [data, setData] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const load = async () => {

    try {

      setLoading(true);

      const result =
        await justificationsService
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
      title: "Día de la falta",
      dataIndex: "date",
      render: (v: string) =>
        formatDate(v),
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
              `/justifications/${r.id}`,
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
      title="Mis Justificaciones"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            navigate(
              "/justifications/new",
            )
          }
        >
          Justificar falta
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
              description="Sin justificaciones reportadas"
            />
          ),
        }}
      />

    </Card>
  );
}
