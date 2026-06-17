import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Upload,
  Spin,
  notification,
  Image,
} from "antd";

import {
  UploadOutlined,
  CameraOutlined,
} from "@ant-design/icons";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  INCIDENT_TYPES,
} from "../../constants/incidents";

import incidentsService
  from "../../services/incidents.service";

const { TextArea } = Input;

export default function CreateIncident() {

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [submitting, setSubmitting] =
    useState(false);

  const [photo, setPhoto] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const beforeUpload = (
    file: File,
  ) => {

    setPhoto(file);

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(
        reader.result as string,
      );
    };

    reader.readAsDataURL(file);

    return false;
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreview(null);
  };

  const onFinish =
    async (values: any) => {

      try {

        setSubmitting(true);

        const formData =
          new FormData();

        formData.append(
          "type",
          values.type,
        );

        formData.append(
          "description",
          values.description,
        );

        if (photo) {
          formData.append(
            "photo",
            photo,
          );
        }

        await incidentsService
          .create(formData);

        notification.success({
          message:
            "Incidente reportado",
          description:
            "Tu incidente fue enviado correctamente.",
        });

        form.resetFields();
        setPhoto(null);
        setPreview(null);

        navigate(
          "/incidents/mine",
        );

      } catch (error: any) {

        notification.error({
          message:
            "Error al reportar",
          description:
            error?.response?.data?.message ||
            "No se pudo enviar el incidente.",
        });

      } finally {
        setSubmitting(false);
      }
    };

  return (
    <Card title="Reportar Incidente">

      <Spin spinning={submitting}>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >

          <Form.Item
            label="Tipo de incidente"
            name="type"
            rules={[
              {
                required: true,
                message:
                  "Seleccione el tipo",
              },
            ]}
          >
            <Select
              placeholder="Seleccione tipo"
              options={INCIDENT_TYPES}
            />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="description"
            rules={[
              {
                required: true,
                message:
                  "Describa el incidente",
              },
              {
                min: 10,
                message:
                  "Mínimo 10 caracteres",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describa lo ocurrido con el mayor detalle posible"
            />
          </Form.Item>

          <Form.Item label="Foto (opcional)">

            <Upload
              accept="image/*"
              capture="environment"
              maxCount={1}
              beforeUpload={beforeUpload}
              onRemove={removePhoto}
              showUploadList={false}
            >
              <Button
                icon={
                  <CameraOutlined />
                }
              >
                {photo
                  ? "Cambiar foto"
                  : "Tomar / Subir foto"}
              </Button>
            </Upload>

            {preview && (
              <div
                style={{
                  marginTop: 12,
                }}
              >
                <Image
                  src={preview}
                  alt="preview"
                  width={240}
                  style={{
                    borderRadius: 8,
                  }}
                />

                <br />

                <Button
                  type="link"
                  danger
                  onClick={removePhoto}
                  icon={
                    <UploadOutlined />
                  }
                >
                  Quitar foto
                </Button>
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
            >
              Reportar incidente
            </Button>
          </Form.Item>

        </Form>

      </Spin>

    </Card>
  );
}
