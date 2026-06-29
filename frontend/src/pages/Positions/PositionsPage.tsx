import {
  Button,
  Card,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
} from "antd";

import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { api } from "../../services/auth.service";

interface Position {
  id: string;
  name: string;
  active: boolean;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    const res = await api.get("/positions");
    setPositions(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const onNew = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const onEdit = (record: Position) => {
    setEditing(record);
    form.setFieldsValue({ name: record.name });
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    try {
      await api.delete(`/positions/${id}`);
      message.success("Cargo eliminado");
      load();
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || "No se pudo eliminar el cargo",
      );
    }
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        await api.patch(`/positions/${editing.id}`, values);
        message.success("Cargo actualizado");
      } else {
        await api.post("/positions", values);
        message.success("Cargo creado");
      }

      setOpen(false);
      form.resetFields();
      load();
    } catch (error: any) {
      if (error?.errorFields) return;
      const msg = error?.response?.data?.message;
      message.error(msg || "Error al guardar");
    }
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "Estado",
      dataIndex: "active",
      render: (v: boolean) =>
        v ? <Tag color="green">Activo</Tag> : <Tag color="red">Inactivo</Tag>,
    },
    {
      title: "Acciones",
      width: 160,
      render: (_: any, record: Position) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Eliminar este cargo?"
            okText="Sí"
            cancelText="No"
            onConfirm={() => onDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Gestión de Cargos"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
            Nuevo Cargo
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={positions} />
      </Card>

      <Modal
        title={editing ? "Editar Cargo" : "Nuevo Cargo"}
        open={open}
        onOk={save}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        okText={editing ? "Guardar" : "Crear"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Nombre del cargo"
            name="name"
            rules={[
              { required: true, message: "El nombre es obligatorio" },
              { min: 2, message: "Mínimo 2 caracteres" },
            ]}
          >
            <Input placeholder="Ej: Lavador, Cajero, Supervisor..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
