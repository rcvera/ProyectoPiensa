import {
  Button,
  Card,
  Table,
  Tag,
} from "antd";

import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import EmployeeModal from "./EmployeeModal";

import "./EmployeesPage.css";

export default function EmployeesPage() {

  const [employees, setEmployees] =
    useState([]);

  const [open, setOpen] =
    useState(false);

  const loadEmployees =
    async () => {

      const response =
        await axios.get(
          "http://localhost:3000/users"
        );

      setEmployees(
        response.data
      );
    };

  useEffect(() => {
    loadEmployees();
  }, []);

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "Correo",
      dataIndex: "email",
    },
    {
      title: "Cargo",
      dataIndex: "position",
    },
    {
      title: "Estado",
      render: (_: any, record: any) =>
        record.active ? (
          <Tag color="green">
            Activo
          </Tag>
        ) : (
          <Tag color="red">
            Inactivo
          </Tag>
        ),
    },
  ];

  return (
    <>
      <Card
        title="Gestión de Empleados"
        extra={
          <Button
            type="primary"
            onClick={() =>
              setOpen(true)
            }
          >
            Nuevo Empleado
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={employees}
        />
      </Card>

      <EmployeeModal
        open={open}
        onClose={() =>
          setOpen(false)
        }
        reload={loadEmployees}
      />
    </>
  );
}