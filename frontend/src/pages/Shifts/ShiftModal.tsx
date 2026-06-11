import {
  Modal,
  Form,
  Input,
  TimePicker,
  message,
} from "antd";

import axios from "axios";

import dayjs from "dayjs";

export default function ShiftModal({
  open,
  onClose,
  reload,
}: any) {

  const [form] = Form.useForm();

  const save = async () => {

    try {

      const values =
        await form.validateFields();

      await axios.post(
        "http://localhost:3000/shifts",
        {
          ...values,
          startTime:
            values.startTime.format(
              "HH:mm"
            ),
          endTime:
            values.endTime.format(
              "HH:mm"
            ),
        }
      );

      message.success(
        "Turno creado"
      );

      reload();

      form.resetFields();

      onClose();

    } catch {
      message.error(
        "Error al guardar"
      );
    }
  };

  return (
    <Modal
      title="Nuevo Turno"
      open={open}
      onCancel={onClose}
      onOk={save}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="Nombre"
          name="name"
          rules={[
            { required: true }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hora Entrada"
          name="startTime"
          rules={[
            { required: true }
          ]}
        >
          <TimePicker
            format="HH:mm"
            style={{
              width: "100%",
            }}
          />
        </Form.Item>

        <Form.Item
          label="Hora Salida"
          name="endTime"
          rules={[
            { required: true }
          ]}
        >
          <TimePicker
            format="HH:mm"
            style={{
              width: "100%",
            }}
          />
        </Form.Item>

        <Form.Item
          label="Días"
          name="days"
        >
          <Input
            placeholder="Lun-Mar-Mie-Jue-Vie"
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}