import {
  Modal,
  Form,
  Select,
  message,
} from "antd";

import axios from "axios";
import { useEffect, useState } from "react";

export default function AssignmentModal({
  open,
  onClose,
  reload,
}: any) {

  const [form] = Form.useForm();

  const [users, setUsers] =
    useState([]);

  const [shifts, setShifts] =
    useState([]);

  useEffect(() => {

    axios
      .get("http://localhost:3000/users")
      .then((r) =>
        setUsers(r.data)
      );

    axios
      .get("http://localhost:3000/shifts")
      .then((r) =>
        setShifts(r.data)
      );

  }, []);

  const save = async () => {

    const values =
      await form.validateFields();

    await axios.post(
      "http://localhost:3000/assignments",
      values
    );

    message.success(
      "Turno asignado"
    );

    reload();

    onClose();
  };

  return (
    <Modal
      title="Asignar Turno"
      open={open}
      onOk={save}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">

        <Form.Item
          label="Empleado"
          name="userId"
          rules={[
            { required: true }
          ]}
        >
          <Select
            options={users.map(
              (u: any) => ({
                label: u.name,
                value: u.id,
              })
            )}
          />
        </Form.Item>

        <Form.Item
          label="Turno"
          name="shiftId"
          rules={[
            { required: true }
          ]}
        >
          <Select
            options={shifts.map(
              (s: any) => ({
                label: s.name,
                value: s.id,
              })
            )}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}