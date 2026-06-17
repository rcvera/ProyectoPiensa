import {
  Card,
  Descriptions,
  Tag,
  Image,
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
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import incidentsService
  from "../../services/incidents.service";

import {
  API_BASE,
  INCIDENT_STATUS,
  getStatusMeta,
  getTypeLabel,
} from "../../constants/incidents";

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

export default function IncidentDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [incident, setIncident] =
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
        await incidentsService.getById(id);
      setIncident(data);
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
          "No se pudo cargar el incidente",
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
      await incidentsService.respond(
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

  if (!incident) {
    return (
      <Card>
        <Empty description="Incidente no encontrado" />
      </Card>
    );
  }

  const statusMeta = getStatusMeta(
    incident.status,
  );

  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ width: "100%" }}
    >

      <Card
        title="Detalle del Incidente"
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
            {incident.user?.name || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            {incident.user?.email || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Tipo">
            <Tag color="geekblue">
              {getTypeLabel(incident.type)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Estado">
            <Tag color={statusMeta.color}>
              {statusMeta.label}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Fecha">
            {new Date(
              incident.createdAt,
            ).toLocaleString()}
          </Descriptions.Item>

          <Descriptions.Item label="Revisado por">
            {incident.reviewedBy?.name ||
              "—"}
          </Descriptions.Item>

          <Descriptions.Item
            label="Descripción"
            span={2}
          >
            {incident.description}
          </Descriptions.Item>

          {incident.adminResponse && (
            <Descriptions.Item
              label="Respuesta"
              span={2}
            >
              {incident.adminResponse}
            </Descriptions.Item>
          )}
        </Descriptions>

        {incident.photoUrl && (
          <div style={{ marginTop: 16 }}>
            <Image
              src={`${API_BASE}${incident.photoUrl}`}
              alt="incidente"
              style={{ maxWidth: 480 }}
            />
          </div>
        )}

      </Card>

      {canRespond && (
        <Card title="Responder / Actualizar estado">

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
                options={INCIDENT_STATUS.map(
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
