import {
  Card,
  Descriptions,
  Tag,
  Button as AntButton,
  Form,
  Select,
  Input,
  Button,
  Spin,
  notification,
  Space,
  Empty,
} from "antd";

import {
  FileOutlined,
} from "@ant-design/icons";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import justificationsService
  from "../../services/justifications.service";

import {
  API_BASE,
  JUSTIFICATION_STATUS,
  getStatusMeta,
  getTypeLabel,
} from "../../constants/justifications";

const { TextArea } = Input;

const getUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "{}",
    );
  } catch {
    return {};
  }
};

const isImage = (url: string) =>
  /\.(png|jpe?g|gif|webp)$/i.test(url);

export default function JustificationDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [justification, setJustification] =
    useState<any>(null);

  const currentUser = getUser();
  const canRespond =
    currentUser.role === "ADMIN" ||
    currentUser.role === "SUPERVISOR";

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data =
        await justificationsService.getById(id);
      setJustification(data);
      form.setFieldsValue({
        status: data.status,
        adminResponse:
          data.adminResponse || "",
      });
    } catch (error: any) {
      notification.error({
        message: "Error",
        description:
          error?.response?.data?.message ||
          "No se pudo cargar la justificación",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onFinish = async (values: any) => {
    if (!id) return;
    try {
      setSaving(true);
      await justificationsService.respond(
        id,
        {
          status: values.status,
          adminResponse:
            values.adminResponse,
        },
      );
      notification.success({
        message: "Respuesta guardada",
      });
      load();
    } catch (error: any) {
      notification.error({
        message: "Error al responder",
        description:
          error?.response?.data?.message ||
          "No se pudo guardar la respuesta",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Spin />
      </Card>
    );
  }

  if (!justification) {
    return (
      <Card>
        <Empty description="Justificación no encontrada" />
      </Card>
    );
  }

  const statusMeta = getStatusMeta(
    justification.status,
  );

  const documentUrl =
    justification.documentUrl
      ? `${API_BASE}${justification.documentUrl}`
      : null;

  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ width: "100%" }}
    >

      <Card
        title="Detalle de la Justificación"
        extra={
          <Button
            onClick={() =>
              navigate(-1)
            }
          >
            Volver
          </Button>
        }
      >

        <Descriptions
          column={2}
          bordered
          size="small"
        >
          <Descriptions.Item label="Empleado">
            {justification.user?.name || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            {justification.user?.email || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Motivo">
            <Tag color="geekblue">
              {getTypeLabel(justification.type)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Estado">
            <Tag color={statusMeta.color}>
              {statusMeta.label}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Día de la falta">
            {new Date(
              justification.date,
            ).toLocaleDateString()}
          </Descriptions.Item>

          <Descriptions.Item label="Revisado por">
            {justification.reviewedBy?.name ||
              "—"}
          </Descriptions.Item>

          <Descriptions.Item
            label="Descripción"
            span={2}
          >
            {justification.description}
          </Descriptions.Item>

          {justification.adminResponse && (
            <Descriptions.Item
              label="Respuesta"
              span={2}
            >
              {justification.adminResponse}
            </Descriptions.Item>
          )}
        </Descriptions>

        {documentUrl && (
          <div style={{ marginTop: 16 }}>
            {isImage(justification.documentUrl) ? (
              <img
                src={documentUrl}
                alt="certificado"
                style={{
                  maxWidth: 480,
                  borderRadius: 8,
                }}
              />
            ) : (
              <AntButton
                icon={<FileOutlined />}
                href={documentUrl}
                target="_blank"
                rel="noreferrer"
              >
                Ver documento adjunto
              </AntButton>
            )}
          </div>
        )}

      </Card>

      {canRespond && (
        <Card title="Aprobar / Rechazar">

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >

            <Form.Item
              label="Estado"
              name="status"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                options={JUSTIFICATION_STATUS.map(
                  (s) => ({
                    value: s.value,
                    label: s.label,
                  }),
                )}
              />
            </Form.Item>

            <Form.Item
              label="Respuesta al empleado"
              name="adminResponse"
            >
              <TextArea
                rows={4}
                placeholder="Mensaje al empleado (opcional)"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
              >
                Guardar respuesta
              </Button>
            </Form.Item>

          </Form>

        </Card>
      )}

    </Space>
  );
}
