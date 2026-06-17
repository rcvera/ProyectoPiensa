import {
  Modal,
  Form,
  Input,
  TimePicker,
  message,
} from "antd";

import { useEffect } from "react";

import dayjs from "dayjs";

import { api } from "../../services/auth.service";

interface ShiftModalProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  shift?: any | null;
}

export default function ShiftModal({
  open,
  onClose,
  reload,
  shift,
}: ShiftModalProps) {

  const [form] = Form.useForm();

  const isEdit = !!shift;

  useEffect(() => {
    if (open) {
      if (shift) {
        form.setFieldsValue({
          name: shift.name,
          startTime: shift.startTime
            ? dayjs(
                shift.startTime,
                "HH:mm",
              )
            : null,
          endTime: shift.endTime
            ? dayjs(
                shift.endTime,
                "HH:mm",
              )
            : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, shift]);

  const save = async () => {

    try {

      const values =
        await form.validateFields();

      const payload = {
        name: values.name,
        startTime: values.startTime
          ? values.startTime.format(
              "HH:mm",
            )
          : null,
        endTime: values.endTime
          ? values.endTime.format(
              "HH:mm",
            )
          : null,
      };

      if (isEdit) {
        await api.patch(
          `/shifts/${shift.id}`,
          payload,
        );
        message.success(
          "Turno actualizado",
        );
      } else {
        await api.post(
          "/shifts",
          payload,
        );
        message.success(
          "Turno creado",
        );
      }

      reload();
      form.resetFields();
      onClose();

    } catch (err: any) {
      if (err?.errorFields) return;

      const status =
        err?.response?.status;

      if (status === 401) {
        message.error(
          "No autorizado. Iniciá sesión de nuevo.",
        );
      } else if (status === 403) {
        message.error(
          "Solo el administrador puede gestionar turnos.",
        );
      } else {
        message.error(
          err?.response?.data?.message ||
            "Error al guardar",
        );
      }
    }
  };

  return (
    <Modal
      title={
        isEdit
          ? "Editar Turno"
          : "Nuevo Turno"
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={save}
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
              message: "Ingresá el nombre",
            },
          ]}
        >
          <Input placeholder="Ej: Mañana, Tarde, Medio Turno" />
        </Form.Item>

        <Form.Item
          label="Hora de entrada"
          name="startTime"
          extra="Dejar vacío para un turno tipo 'libre'"
        >
          <TimePicker
            format="HH:mm"
            minuteStep={15}
            style={{
              width: "100%",
            }}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Hora de salida"
          name="endTime"
        >
          <TimePicker
            format="HH:mm"
            minuteStep={15}
            style={{
              width: "100%",
            }}
            allowClear
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
