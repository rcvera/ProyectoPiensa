import { Modal, Form, Input, message } from "antd";
import { api } from "../services/auth.service";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [form] = Form.useForm();

  const save = async () => {
    try {
      const values = await form.validateFields();

      if (values.newPassword !== values.confirmPassword) {
        message.error("Las contraseñas nuevas no coinciden");
        return;
      }

      await api.patch("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success("Contraseña actualizada correctamente");
      form.resetFields();
      onClose();
    } catch (error: any) {
      if (error?.errorFields) return;
      const msg = error?.response?.data?.message;
      message.error(msg || "Error al cambiar la contraseña");
    }
  };

  return (
    <Modal
      title="Cambiar contraseña"
      open={open}
      onOk={save}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Actualizar"
      width={420}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item
          label="Contraseña actual"
          name="currentPassword"
          rules={[{ required: true, message: "Ingresá tu contraseña actual" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Nueva contraseña"
          name="newPassword"
          rules={[
            { required: true, message: "Ingresá la nueva contraseña" },
            { min: 6, message: "Mínimo 6 caracteres" },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirmar nueva contraseña"
          name="confirmPassword"
          rules={[{ required: true, message: "Confirmá la nueva contraseña" }]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
}
