import {
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";

import { useEffect } from "react";

import { api } from "../../services/auth.service";

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

  const isEdit = !!employee;

  useEffect(() => {
    if (open) {
      if (employee) {
        form.setFieldsValue({
          name: employee.name,
          email: employee.email,
          role: employee.role,
          phone: employee.phone,
          position: employee.position,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          role: "EMPLOYEE",
        });
      }
    }
  }, [open, employee]);

  const save = async () => {

    try {

      const values =
        await form.validateFields();

      if (isEdit) {

        const payload: any = {
          name: values.name,
          email: values.email,
          role: values.role,
          phone: values.phone,
          position: values.position,
        };

        if (values.password) {
          payload.password = values.password;
        }

        await api.patch(
          `/users/${employee.id}`,
          payload,
        );

        message.success(
          "Empleado actualizado",
        );

      } else {

        await api.post(
          "/users",
          values,
        );

        message.success(
          "Empleado creado",
        );
      }

      reload();
      form.resetFields();
      onClose();

    } catch (error: any) {

      if (error?.errorFields) {
        return;
      }

      const status =
        error?.response?.status;

      const msg =
        error?.response?.data?.message;

      if (status === 401) {
        message.error(
          "No autorizado. Iniciá sesión de nuevo.",
        );
      } else if (status === 403) {
        message.error(
          "Solo el administrador puede gestionar empleados.",
        );
      } else if (status === 409) {
        message.error(
          "Ese correo ya está registrado.",
        );
      } else if (status === 404) {
        message.error(
          "Empleado no encontrado.",
        );
      } else if (Array.isArray(msg)) {
        message.error(msg.join(" · "));
      } else {
        message.error(
          msg || "Error al guardar",
        );
      }
    }
  };

  return (
    <Modal
      title={
        isEdit
          ? "Editar Empleado"
          : "Nuevo Empleado"
      }
      open={open}
      onOk={save}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText={
        isEdit ? "Guardar" : "Crear"
      }
    >
      <Form
        form={form}
        layout="vertical"
      >

        <Form.Item
          label="Nombre"
          name="name"
          rules={[
            {
              required: true,
              message: "El nombre es obligatorio",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Correo"
          name="email"
          rules={[
            {
              required: true,
              message: "El correo es obligatorio",
            },
            {
              type: "email",
              message: "Correo inválido",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={
            isEdit
              ? "Nueva contraseña (opcional)"
              : "Contraseña"
          }
          name="password"
          rules={
            isEdit
              ? [
                  {
                    min: 6,
                    message:
                      "Mínimo 6 caracteres",
                  },
                ]
              : [
                  {
                    required: true,
                    message:
                      "La contraseña es obligatoria",
                  },
                  {
                    min: 6,
                    message:
                      "Mínimo 6 caracteres",
                  },
                ]
          }
        >
          <Input.Password
            placeholder={
              isEdit
                ? "Dejar vacío para no cambiar"
                : ""
            }
          />
        </Form.Item>

        <Form.Item
          label="Rol"
          name="role"
          rules={[
            { required: true },
          ]}
        >
          <Select
            options={[
              {
                value: "EMPLOYEE",
                label: "Empleado",
              },
              {
                value: "SUPERVISOR",
                label: "Supervisor",
              },
              {
                value: "ADMIN",
                label: "Administrador",
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Teléfono"
          name="phone"
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Cargo"
          name="position"
        >
          <Input />
        </Form.Item>

      </Form>
    </Modal>
  );
}
