import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Radio,
  Input,
  notification,
  Empty,
  Space,
  Typography,
} from "antd";

import {
  useEffect,
  useState,
} from "react";

import {
  EditOutlined,
} from "@ant-design/icons";

import workloadSurveysService
  from "../../services/workloadSurveys.service";

import {
  SCALE_OPTIONS,
  SURVEY_QUESTIONS,
  formatMonthYear,
  getSurveyStatus,
} from "../../constants/workloadSurveys";

const { TextArea } = Input;
const { Text } = Typography;

export default function MyWorkloadSurveys() {

  const [form] = Form.useForm();

  const [data, setData] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [active, setActive] =
    useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      const result =
        await workloadSurveysService.listMine();
      setData(result || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAnswer = (record: any) => {
    setActive(record);
    form.setFieldsValue({
      hoursFeeling: record.hoursFeeling || undefined,
      physicalLoad: record.physicalLoad || undefined,
      emotionalLoad: record.emotionalLoad || undefined,
      comments: record.comments || "",
    });
  };

  const closeAnswer = () => {
    setActive(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    if (!active) return;
    try {
      setSaving(true);
      await workloadSurveysService.answer(
        active.id,
        values,
      );
      notification.success({
        message: "Encuesta enviada",
        description: "Gracias por responder la encuesta de carga laboral.",
      });
      closeAnswer();
      load();
    } catch (error: any) {
      notification.error({
        message: "Error al enviar",
        description:
          error?.response?.data?.message ||
          "No se pudo guardar la encuesta.",
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Periodo",
      render: (_: any, r: any) =>
        formatMonthYear(r.month, r.year),
    },
    {
      title: "Estado",
      render: (_: any, r: any) => {
        const meta = getSurveyStatus(r.completedAt);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "Horas",
      dataIndex: "hoursFeeling",
      render: (v: number) => v ?? "—",
    },
    {
      title: "Carga física",
      dataIndex: "physicalLoad",
      render: (v: number) => v ?? "—",
    },
    {
      title: "Carga emocional",
      dataIndex: "emotionalLoad",
      render: (v: number) => v ?? "—",
    },
    {
      title: "Acciones",
      render: (_: any, r: any) => (
        <Button
          size="small"
          type={r.completedAt ? "default" : "primary"}
          icon={<EditOutlined />}
          onClick={() => openAnswer(r)}
        >
          {r.completedAt ? "Ver / editar" : "Responder"}
        </Button>
      ),
    },
  ];

  return (
    <Card title="Mi Encuesta de Carga Laboral">

      <Text type="secondary">
        Cuando superas el límite mensual de horas extra, el sistema genera automáticamente
        una encuesta para que cuentes cómo te sientes con tu carga de trabajo.
      </Text>

      <Table
        style={{ marginTop: 16 }}
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        locale={{
          emptyText: (
            <Empty description="No tienes encuestas de carga laboral" />
          ),
        }}
      />

      <Modal
        open={!!active}
        onCancel={closeAnswer}
        title={
          active
            ? `Encuesta de ${formatMonthYear(active.month, active.year)}`
            : ""
        }
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {SURVEY_QUESTIONS.map((q) => (
            <Form.Item
              key={q.name}
              label={q.label}
              name={q.name}
              rules={[
                { required: true, message: "Seleccione una calificación" },
              ]}
            >
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                options={SCALE_OPTIONS}
              />
            </Form.Item>
          ))}

          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginTop: -8,
              marginBottom: 16,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              1 = {SURVEY_QUESTIONS[0].lowLabel}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              5 = {SURVEY_QUESTIONS[0].highLabel}
            </Text>
          </Space>

          <Form.Item
            label="Comentarios (opcional)"
            name="comments"
          >
            <TextArea
              rows={3}
              placeholder="Cuéntanos algo más sobre cómo te sientes con tu carga de trabajo"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              block
            >
              Enviar respuesta
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </Card>
  );
}
