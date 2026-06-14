import {
  Card,
  Button,
  Row,
  Col,
} from "antd";

import {
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

import "./ReportsPage.css";

export default function ReportsPage() {

  const download =
    (url: string) => {
      window.open(
        url,
        "_blank",
      );
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
              onClick={() =>
                download(
                  "http://localhost:3000/reports/employees/pdf",
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
              onClick={() =>
                download(
                  "http://localhost:3000/reports/employees/excel",
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
              onClick={() =>
                download(
                  "http://localhost:3000/reports/overtimes/pdf",
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
              onClick={() =>
                download(
                  "http://localhost:3000/reports/overtimes/excel",
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