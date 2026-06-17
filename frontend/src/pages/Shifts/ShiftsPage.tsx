import {
  Button,
  Card,
  Table,
  Tag,
  Space,
  Popconfirm,
  message,
} from "antd";

import {
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import {
  useEffect,
  useState,
} from "react";

import { api } from "../../services/auth.service";

import ShiftModal from "./ShiftModal";

import "./ShiftsPage.css";

export default function ShiftsPage() {

  const [open, setOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<any | null>(null);

  const [shifts, setShifts] =
    useState<any[]>([]);

  const loadShifts = async () => {

    const response = await api.get(
      "/shifts",
    );

    setShifts(response.data);
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const onNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (record: any) => {
    setEditing(record);
    setOpen(true);
  };

  const onClose = () => {
    setEditing(null);
    setOpen(false);
  };

  const onToggleActive = async (
    record: any,
  ) => {
    try {
      if (record.active) {
        await api.delete(
          `/shifts/${record.id}`,
        );
        message.success(
          "Turno desactivado",
        );
      } else {
        await api.patch(
          `/shifts/${record.id}/activate`,
        );
        message.success(
          "Turno reactivado",
        );
      }
      loadShifts();
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          "No se pudo cambiar el estado",
      );
    }
  };

  return (
    <>
      <Card
        title="Gestión de Turnos"
        extra={
          <Button
            type="primary"
            onClick={onNew}
          >
            Nuevo Turno
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={[
            {
              title: "Nombre",
              dataIndex: "name",
            },
            {
              title: "Entrada",
              dataIndex: "startTime",
              render: (v: string | null) =>
                v || (
                  <span
                    style={{
                      color: "#bbb",
                    }}
                  >
                    —
                  </span>
                ),
            },
            {
              title: "Salida",
              dataIndex: "endTime",
              render: (v: string | null) =>
                v || (
                  <span
                    style={{
                      color: "#bbb",
                    }}
                  >
                    —
                  </span>
                ),
            },
            {
              title: "Estado",
              render: (
                _: any,
                r: any,
              ) => (
                <Tag
                  color={
                    r.active
                      ? "green"
                      : "red"
                  }
                >
                  {r.active
                    ? "Activo"
                    : "Inactivo"}
                </Tag>
              ),
            },
            {
              title: "Acciones",
              width: 220,
              render: (
                _: any,
                record: any,
              ) => (
                <Space>
                  <Button
                    size="small"
                    icon={
                      <EditOutlined />
                    }
                    onClick={() =>
                      onEdit(record)
                    }
                  >
                    Editar
                  </Button>
                  <Popconfirm
                    title={
                      record.active
                        ? "¿Desactivar turno? No podrá asignarse a nuevos días pero conserva el historial."
                        : "¿Reactivar turno?"
                    }
                    okText="Sí"
                    cancelText="No"
                    onConfirm={() =>
                      onToggleActive(
                        record,
                      )
                    }
                  >
                    <Button
                      size="small"
                      danger={
                        record.active
                      }
                      icon={
                        record.active ? (
                          <StopOutlined />
                        ) : (
                          <CheckCircleOutlined />
                        )
                      }
                    >
                      {record.active
                        ? "Desactivar"
                        : "Reactivar"}
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={shifts}
        />
      </Card>

      <ShiftModal
        open={open}
        onClose={onClose}
        reload={loadShifts}
        shift={editing}
      />
    </>
  );
}
