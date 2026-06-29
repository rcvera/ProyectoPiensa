import {
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";

import { useEffect, useState } from "react";
import { api } from "../../services/auth.service";

interface Position {
  id: string;
  name: string;
  active: boolean;
}

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  employee?: any | null;
}

export default function EmployeeModal({
  open,
  onClose,
  reload,
  employee,
}: EmployeeModalProps) {

  const [form] = Form.useForm();
  const [positions, setPositions] = useState<Position[]>([]);

  const isEdit = !!employee;

  useEffect(() => {
    api.get("/positions").then((r) => setPositions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      if (employee) {
        form.setFieldsValue({
          name: employee.name,
          email: employee.email,
          cedula: employee.cedula,
          role: employee.role,
          phone: employee.phone,
          positionId: employee.positionId ?? undefined,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ role: "EMPLOYEE" });
      }
    }
  }, [open, employee]);

  const save = async () => {
    try {
      const values = await form.validateFields();

      if (isEdit) {
        const payload: any = {
          name: values.name,
          email: values.email,
          cedula: values.cedula || undefined,
          role: values.role,
          phone: values.phone,
          positionId: values.positionId ?? null,
        };

        if (values.password) {
          payload.password = values.password;
        }

        await api.patch(`/users/${employee.id}`, payload);
        message.success("Empleado actualizado");
      } else {
        await api.post("/users", values);
        message.success("Empleado creado");
      }

      reload();
      form.resetFields();
      onClose();

    } catch (error: any) {
      if (error?.errorFields) return;

      const status = error?.response?.status;
      const msg = error?.response?.data?.message;

      if (status === 401) {
        message.error("No autorizado. Iniciá sesión de nuevo.");
      } else if (status === 403) {
        message.error("Solo el administrador puede gestionar empleados.");
      } else if (status === 409) {
        message.error(msg || "Dato duplicado (correo o cédula ya registrado).");
      } else if (status === 404) {
        message.error("Empleado no encontrado.");
      } else if (Array.isArray(msg)) {
        message.error(msg.join(" · "));
      } else {
        message.error(msg || "Error al guardar");
      }
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar Empleado" : "Nuevo Empleado"}
      open={open}
      onOk={save}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText={isEdit ? "Guardar" : "Crear"}
    >
      <Form form={form} layout="vertical">

        <Form.Item
          label="Nombre"
          name="name"
          rules={[{ required: true, message: "El nombre es obligatorio" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Correo"
          name="email"
          rules={[
            { required: true, message: "El correo es obligatorio" },
            { type: "email", message: "Correo inválido" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
          name="password"
          rules={
            isEdit
              ? [{ min: 6, message: "Mínimo 6 caracteres" }]
              : [
                  { required: true, message: "La contraseña es obligatoria" },
                  { min: 6, message: "Mínimo 6 caracteres" },
                ]
          }
        >
          <Input.Password
            placeholder={isEdit ? "Dejar vacío para no cambiar" : ""}
          />
        </Form.Item>

        <Form.Item
          label="Cédula"
          name="cedula"
          rules={[
            {
              pattern: /^\d{10}$/,
              message: "La cédula debe tener exactamente 10 dígitos",
            },
          ]}
        >
          <Input maxLength={10} placeholder="Ej: 1712345678" />
        </Form.Item>

        <Form.Item
          label="Rol"
          name="role"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: "EMPLOYEE", label: "Empleado" },
              { value: "SUPERVISOR", label: "Supervisor" },
              { value: "ADMIN", label: "Administrador" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Teléfono" name="phone">
          <Input />
        </Form.Item>

        <Form.Item label="Cargo" name="positionId">
          <Select
            allowClear
            placeholder="Seleccionar cargo..."
            options={positions
              .filter((p) => p.active)
              .map((p) => ({ value: p.id, label: p.name }))}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
