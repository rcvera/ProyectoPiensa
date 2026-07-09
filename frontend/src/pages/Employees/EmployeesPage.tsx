import {
  Button,
  Card,
  Table,
  Tag,
  Space,
  Dropdown,
  Modal,
  message,
} from "antd";

import {
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  KeyOutlined,
  MoreOutlined,
  ExclamationCircleFilled,
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

  const onResetPassword = (
    record: any,
  ) => {
    Modal.confirm({
      title: "Restablecer contraseña",
      icon: <ExclamationCircleFilled />,
      content: `Se generará una nueva contraseña para ${record.name} y se le enviará por correo a ${record.email}.`,
      okText: "Sí, restablecer",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await api.patch(
            `/users/${record.id}/reset-password`,
          );
          message.success(
            `Se envió la nueva contraseña a ${record.email}`,
          );
        } catch (e: any) {
          message.error(
            e?.response?.data?.message ||
              "No se pudo restablecer la contraseña",
          );
        }
      },
    });
  };

  const onToggleActive = (
    record: any,
  ) => {
    Modal.confirm({
      title: record.active
        ? "Desactivar empleado"
        : "Reactivar empleado",
      icon: <ExclamationCircleFilled />,
      content: record.active
        ? "Conserva el historial pero no podrá ingresar."
        : "El empleado podrá volver a ingresar.",
      okText: "Sí",
      cancelText: "Cancelar",
      okButtonProps: { danger: record.active },
      onOk: async () => {
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
      },
    });
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "Cédula",
      dataIndex: "cedula",
      render: (v: string) =>
        v || <span style={{ color: "#bbb" }}>—</span>,
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
      render: (_: any, record: any) =>
        record.position?.name || (
          <span style={{ color: "#bbb" }}>—</span>
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
      width: 140,
      fixed: "right" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Editar
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: "reset-password",
                  icon: <KeyOutlined />,
                  label: "Restablecer contraseña",
                  onClick: () =>
                    onResetPassword(record),
                },
                {
                  key: "toggle-active",
                  icon: record.active ? (
                    <StopOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  ),
                  danger: record.active,
                  label: record.active
                    ? "Desactivar"
                    : "Reactivar",
                  onClick: () =>
                    onToggleActive(record),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
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
          scroll={{ x: "max-content" }}
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
