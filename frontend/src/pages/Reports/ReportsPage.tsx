import {
  Card,
  Button,
  Row,
  Col,
  message,
} from "antd";

import {
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

import { useState } from "react";

import { api } from "../../services/auth.service";
import "./ReportsPage.css";

export default function ReportsPage() {

  const [loading, setLoading] =
    useState<string | null>(null);

  const download = async (
    path: string,
    filename: string,
  ) => {
    try {
      setLoading(path);
      const response = await api.get(path, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data]),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          "No se pudo descargar el reporte",
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card title="Reportes">

      <Row gutter={20}>

        <Col span={12}>
          <Card>

            <Button
              icon={
                <FilePdfOutlined />
              }
              block
              loading={
                loading ===
                "/reports/employees/pdf"
              }
              onClick={() =>
                download(
                  "/reports/employees/pdf",
                  "empleados.pdf",
                )
              }
            >
              Empleados PDF
            </Button>

            <br />
            <br />

            <Button
              icon={
                <FileExcelOutlined />
              }
              block
              loading={
                loading ===
                "/reports/employees/excel"
              }
              onClick={() =>
                download(
                  "/reports/employees/excel",
                  "empleados.xlsx",
                )
              }
            >
              Empleados Excel
            </Button>

          </Card>
        </Col>

        <Col span={12}>
          <Card>

            <Button
              icon={
                <FilePdfOutlined />
              }
              block
              loading={
                loading ===
                "/reports/overtimes/pdf"
              }
              onClick={() =>
                download(
                  "/reports/overtimes/pdf",
                  "horas-extras.pdf",
                )
              }
            >
              Horas Extras PDF
            </Button>

            <br />
            <br />

            <Button
              icon={
                <FileExcelOutlined />
              }
              block
              loading={
                loading ===
                "/reports/overtimes/excel"
              }
              onClick={() =>
                download(
                  "/reports/overtimes/excel",
                  "horas-extras.xlsx",
                )
              }
            >
              Horas Extras Excel
            </Button>

          </Card>
        </Col>

      </Row>

    </Card>
  );
}
