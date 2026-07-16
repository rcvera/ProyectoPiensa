import {
  Card,
  Button,
  Row,
  Col,
  DatePicker,
  message,
} from "antd";

import {
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import { api } from "../../services/auth.service";
import "./ReportsPage.css";

const { RangePicker } = DatePicker;

export default function ReportsPage() {

  const [loading, setLoading] =
    useState<string | null>(null);

  const [attendanceRange, setAttendanceRange] = useState<
    [Dayjs, Dayjs]
  >([dayjs().startOf("month"), dayjs()]);

  const [payrollMonth, setPayrollMonth] = useState<Dayjs>(dayjs());

  const download = async (
    path: string,
    filename: string,
    params?: Record<string, string>,
  ) => {
    try {
      setLoading(path);
      const response = await api.get(path, {
        responseType: "blob",
        params,
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

      <Row gutter={20} style={{ marginTop: 20 }}>

        <Col span={12}>
          <Card title="Asistencia (Faltas)">

            <RangePicker
              style={{ width: "100%", marginBottom: 16 }}
              value={attendanceRange}
              onChange={(v) => v && v[0] && v[1] && setAttendanceRange([v[0], v[1]])}
              format="DD/MM/YYYY"
              allowClear={false}
            />

            <Button
              icon={<FilePdfOutlined />}
              block
              loading={loading === "/reports/attendance/pdf"}
              onClick={() =>
                download(
                  "/reports/attendance/pdf",
                  "asistencia-faltas.pdf",
                  {
                    from: attendanceRange[0].format("YYYY-MM-DD"),
                    to: attendanceRange[1].format("YYYY-MM-DD"),
                  },
                )
              }
            >
              Asistencia PDF
            </Button>

            <br />
            <br />

            <Button
              icon={<FileExcelOutlined />}
              block
              loading={loading === "/reports/attendance/excel"}
              onClick={() =>
                download(
                  "/reports/attendance/excel",
                  "asistencia-faltas.xlsx",
                  {
                    from: attendanceRange[0].format("YYYY-MM-DD"),
                    to: attendanceRange[1].format("YYYY-MM-DD"),
                  },
                )
              }
            >
              Asistencia Excel
            </Button>

          </Card>
        </Col>

        <Col span={12}>
          <Card title="Pago">

            <DatePicker
              picker="month"
              style={{ width: "100%", marginBottom: 16 }}
              value={payrollMonth}
              onChange={(v) => v && setPayrollMonth(v)}
              format="MMMM YYYY"
              allowClear={false}
            />

            <Button
              icon={<FilePdfOutlined />}
              block
              loading={loading === "/reports/payroll/pdf"}
              onClick={() =>
                download(
                  "/reports/payroll/pdf",
                  "rol-de-pagos.pdf",
                  {
                    month: String(payrollMonth.month() + 1),
                    year: String(payrollMonth.year()),
                  },
                )
              }
            >
              Pago PDF
            </Button>

            <br />
            <br />

            <Button
              icon={<FileExcelOutlined />}
              block
              loading={loading === "/reports/payroll/excel"}
              onClick={() =>
                download(
                  "/reports/payroll/excel",
                  "rol-de-pagos.xlsx",
                  {
                    month: String(payrollMonth.month() + 1),
                    year: String(payrollMonth.year()),
                  },
                )
              }
            >
              Pago Excel
            </Button>

          </Card>
        </Col>

      </Row>

    </Card>
  );
}
