import { Modal, Form, Rate, Input, Typography, Space, Alert } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { useState } from "react";
import { api } from "../services/auth.service";
import { message } from "antd";

const { Text } = Typography;
const { TextArea } = Input;

const RATE_LABELS = ["Muy bajo", "Bajo", "Moderado", "Alto", "Muy alto"];

interface Props {
  survey: { id: string; month: number; year: number } | null;
  onClose: () => void;
}

export default function WorkloadSurveyModal({ survey, onClose }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await api.patch(`/workload-surveys/${survey!.id}/respond`, {
        hoursFeeling: values.hoursFeeling,
        physicalLoad: values.physicalLoad,
        emotionalLoad: values.emotionalLoad,
        comments: values.comments || undefined,
      });
      message.success("Encuesta enviada. ¡Gracias por tu respuesta!");
      form.resetFields();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error("Error al enviar la encuesta");
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  return (
    <Modal
      open={!!survey}
      title={
        <Space>
          <WarningOutlined style={{ color: "#fa8c16" }} />
          Encuesta de Sobrecarga Laboral
        </Space>
      }
      okText="Enviar encuesta"
      cancelText="Responder más tarde"
      onOk={submit}
      onCancel={onClose}
      confirmLoading={loading}
      width={500}
      mask={{ closable: false }}
    >
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 20 }}
        message={`Has superado las 48 horas extra en ${monthNames[(survey?.month ?? 1) - 1]} ${survey?.year}. Por favor responde esta breve encuesta.`}
      />

      <Form form={form} layout="vertical">
        <Form.Item
          label={<Text strong>¿Cómo percibes tu carga de horas este mes?</Text>}
          name="hoursFeeling"
          rules={[{ required: true, message: "Por favor selecciona una valoración" }]}
        >
          <Rate tooltips={RATE_LABELS} />
        </Form.Item>

        <Form.Item
          label={<Text strong>¿Cuál es tu nivel de carga física en el trabajo?</Text>}
          name="physicalLoad"
          rules={[{ required: true, message: "Por favor selecciona una valoración" }]}
        >
          <Rate tooltips={RATE_LABELS} />
        </Form.Item>

        <Form.Item
          label={<Text strong>¿Cuál es tu nivel de carga emocional o estrés?</Text>}
          name="emotionalLoad"
          rules={[{ required: true, message: "Por favor selecciona una valoración" }]}
        >
          <Rate tooltips={RATE_LABELS} />
        </Form.Item>

        <Form.Item
          label="Comentarios adicionales (opcional)"
          name="comments"
        >
          <TextArea rows={3} placeholder="¿Hay algo más que quieras comentar?" maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
