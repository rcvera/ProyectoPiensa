import {
  Card,
  Form,
  Select,
  Input,
  DatePicker,
  Button,
  Upload,
  Spin,
  notification,
  Alert,
} from "antd";

import {
  UploadOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import dayjs, { Dayjs } from "dayjs";

import {
  JUSTIFICATION_TYPES,
} from "../../constants/justifications";

import justificationsService
  from "../../services/justifications.service";

const { TextArea } = Input;
const { Dragger } = Upload;

export default function CreateJustification() {

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [submitting, setSubmitting] =
    useState(false);

  const [document, setDocument] =
    useState<File | null>(null);

  const beforeUpload = (
    file: File,
  ) => {
    setDocument(file);
    return false;
  };

  const removeDocument = () => {
    setDocument(null);
  };

  const onFinish =
    async (values: any) => {

      try {

        setSubmitting(true);

        const formData =
          new FormData();

        formData.append(
          "date",
          (values.date as Dayjs).format(
            "YYYY-MM-DD",
          ),
        );

        formData.append(
          "type",
          values.type,
        );

        formData.append(
          "description",
          values.description,
        );

        if (document) {
          formData.append(
            "document",
            document,
          );
        }

        await justificationsService
          .create(formData);

        notification.success({
          message:
            "Justificación enviada",
          description:
            "Tu justificación fue registrada y quedó pendiente de revisión.",
        });

        form.resetFields();
        setDocument(null);

        navigate(
          "/justifications/mine",
        );

      } catch (error: any) {

        notification.error({
          message:
            "Error al enviar",
          description:
            error?.response?.data?.message ||
            "No se pudo enviar la justificación.",
        });

      } finally {
        setSubmitting(false);
      }
    };

  return (
    <Card title="Justificar una falta">

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Notifica tu ausencia lo antes posible"
        description="Indica el día que faltaste (o faltarás), el motivo y adjunta el certificado o documento de respaldo si lo tienes. Un administrador o supervisor revisará tu solicitud."
      />

      <Spin spinning={submitting}>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            date: dayjs(),
          }}
        >

          <Form.Item
            label="Día de la falta"
            name="date"
            rules={[
              {
                required: true,
                message:
                  "Seleccione la fecha",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label="Motivo"
            name="type"
            rules={[
              {
                required: true,
                message:
                  "Seleccione el motivo",
              },
            ]}
          >
            <Select
              placeholder="Seleccione el motivo"
              options={JUSTIFICATION_TYPES}
            />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="description"
            rules={[
              {
                required: true,
                message:
                  "Describa el motivo de la falta",
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
              placeholder="Ej: certificado médico por gripe, entregado por 2 días de reposo"
            />
          </Form.Item>

          <Form.Item label="Certificado o documento de respaldo (opcional)">

            <Dragger
              accept="image/*,application/pdf"
              maxCount={1}
              beforeUpload={beforeUpload}
              onRemove={removeDocument}
              fileList={
                document
                  ? [
                      {
                        uid: "-1",
                        name: document.name,
                        status: "done",
                      } as any,
                    ]
                  : []
              }
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Arrastra el archivo o haz clic para subirlo
              </p>
              <p className="ant-upload-hint">
                Certificado médico, acta de defunción, etc. Imagen o PDF, máx. 5 MB.
              </p>
            </Dragger>

          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<UploadOutlined />}
              block
            >
              Enviar justificación
            </Button>
          </Form.Item>

        </Form>

      </Spin>

    </Card>
  );
}
