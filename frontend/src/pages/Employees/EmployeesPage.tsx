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

import EmployeeModal from "./EmployeeModal";

import "./EmployeesPage.css";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Administrador", color: "purple" },
  SUPERVISOR: { label: "Supervisor", color: "blue" },
  EMPLOYEE: { label: "Empleado", color: "default" },
};

export default function EmployeesPage() {

  const [employees, setEmployees] =
    useState<any[]>([]);

  const [open, setOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<any | null>(null);

  const loadEmployees = async () => {

    const response = await api.get(
      "/users",
    );

    setEmployees(response.data);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const onEdit = (record: any) => {
    setEditing(record);
    setOpen(true);
  };

  const onNew = () => {
    setEditing(null);
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
          `/users/${record.id}`,
        );
        message.success(
          "Empleado desactivado",
        );
      } else {
        await api.patch(
          `/users/${record.id}/activate`,
        );
        message.success(
          "Empleado reactivado",
        );
      }
      loadEmployees();
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          "No se pudo cambiar el estado",
      );
    }
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "Correo",
      dataIndex: "email",
    },
    {
      title: "Rol",
      dataIndex: "role",
      render: (v: string) => {
        const meta =
          ROLE_LABELS[v] || {
            label: v,
            color: "default",
          };
        return (
          <Tag color={meta.color}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: "Cargo",
      dataIndex: "position",
      render: (v: string) =>
        v || (
          <span
            style={{ color: "#bbb" }}
          >
            —
          </span>
        ),
    },
    {
      title: "Estado",
      render: (_: any, record: any) =>
        record.active ? (
          <Tag color="green">Activo</Tag>
        ) : (
          <Tag color="red">Inactivo</Tag>
        ),
    },
    {
      title: "Acciones",
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title={
              record.active
                ? "¿Desactivar empleado? Conserva el historial pero no podrá ingresar."
                : "¿Reactivar empleado?"
            }
            okText="Sí"
            cancelText="No"
            onConfirm={() =>
              onToggleActive(record)
            }
          >
            <Button
              size="small"
              danger={record.active}
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
  ];

  return (
    <>
      <Card
        title="Gestión de Empleados"
        extra={
          <Button
            type="primary"
            onClick={onNew}
          >
            Nuevo Empleado
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={employees}
        />
      </Card>

      <EmployeeModal
        open={open}
        onClose={onClose}
        reload={loadEmployees}
        employee={editing}
      />
    </>
  );
}
