import {
  Modal,
  Form,
  Input,
  message,
} from "antd";

import axios from "axios";

export default function EmployeeModal({
  open,
  onClose,
  reload,
}: any) {

  const [form] = Form.useForm();

  const save =
    async () => {

      try {

        const values =
          await form.validateFields();

        await axios.post(
          "http://localhost:3000/users",
          values
        );

        message.success(
          "Empleado creado"
        );

        reload();

        form.resetFields();

        onClose();

      } catch (error) {

        message.error(
          "Error al guardar"
        );
      }
    };

  return (
    <Modal
      title="Nuevo Empleado"
      open={open}
      onOk={save}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">

        <Form.Item
          label="Nombre"
          name="name"
          rules={[
            {
              required: true,
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
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Contraseña"
          name="password"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.Password />
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