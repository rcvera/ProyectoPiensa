import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
} from "antd";

import {
  UserOutlined,
  LockOutlined,
  CarOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import { api } from "../services/auth.service";

import "./LoginPage.css";

const { Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const response = await api.post(
        "/auth/login",
        values
      );

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      message.success("Bienvenido");

      navigate("/dashboard");
    } catch (error) {
      message.error(
        "Correo o contraseña incorrectos"
      );
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <CarOutlined className="login-logo" />

          <h1 className="login-title">
            AutoWash Control
          </h1>

          <Text className="login-subtitle">
            Gestión de turnos y control laboral
          </Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[
              {
                required: true,
                message:
                  "Ingrese su correo",
              },
              {
                type: "email",
                message:
                  "Correo inválido",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="correo@empresa.com"
            />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              {
                required: true,
                message:
                  "Ingrese su contraseña",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="********"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="login-button"
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          © 2026 AutoWash Control
        </div>
      </Card>
    </div>
  );
}