import {
  Modal,
  Form,
  Select,
  DatePicker,
  message,
} from "antd";

import { api } from "../../services/auth.service";
import { useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";

interface AssignmentModalProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  users: any[];
  shifts: any[];
  prefilledUserId?: string;
  prefilledDate?: string;
  currentShiftId?: string;
}

export default function AssignmentModal({
  open,
  onClose,
  reload,
  users,
  shifts,
  prefilledUserId,
  prefilledDate,
  currentShiftId,
}: AssignmentModalProps) {

  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        userId: prefilledUserId,
        date: prefilledDate
          ? dayjs(prefilledDate)
          : dayjs(),
        shiftId: currentShiftId,
      });
    }
  }, [
    open,
    prefilledUserId,
    prefilledDate,
    currentShiftId,
  ]);

  const save = async () => {

    try {

      const values =
        await form.validateFields();

      await api.post(
        "/assignments",
        {
          userId: values.userId,
          shiftId: values.shiftId,
          date: (values.date as Dayjs).format(
            "YYYY-MM-DD",
          ),
        },
      );

      message.success(
        "Turno asignado",
      );

      reload();
      form.resetFields();
      onClose();

    } catch (err: any) {
      if (err?.response?.data?.message) {
        message.error(
          err.response.data.message,
        );
      } else if (err?.errorFields) {
        // form validation error already shown
      } else {
        message.error(
          "Error al guardar",
        );
      }
    }
  };

  return (
    <Modal
      title={
        currentShiftId
          ? "Cambiar Turno"
          : "Asignar Turno"
      }
      open={open}
      onOk={save}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
    >
      <Form form={form} layout="vertical">

        <Form.Item
          label="Empleado"
          name="userId"
          rules={[
            { required: true },
          ]}
        >
          <Select
            disabled={!!prefilledUserId}
            options={users.map(
              (u: any) => ({
                label: u.name,
                value: u.id,
              }),
            )}
          />
        </Form.Item>

        <Form.Item
          label="Día"
          name="date"
          rules={[
            { required: true },
          ]}
        >
          <DatePicker
            disabled={!!prefilledDate}
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
          />
        </Form.Item>

        <Form.Item
          label="Turno"
          name="shiftId"
          rules={[
            { required: true },
          ]}
        >
          <Select
            options={shifts.map(
              (s: any) => ({
                label:
                  s.startTime &&
                  s.endTime
                    ? `${s.name} (${s.startTime} - ${s.endTime})`
                    : `${s.name} (sin horario)`,
                value: s.id,
              }),
            )}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
