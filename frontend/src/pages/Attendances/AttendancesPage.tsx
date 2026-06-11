import {
  Card,
  Button,
  Select,
  Table,
  message,
} from "antd";

import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

export default function AttendancesPage() {

  const [users, setUsers] =
    useState([]);

  const [userId, setUserId] =
    useState("");

  const [history, setHistory] =
    useState([]);

  const loadHistory =
    async () => {

      const response =
        await axios.get(
          "http://localhost:3000/attendances"
        );

      setHistory(
        response.data
      );
    };

  useEffect(() => {

    axios
      .get("http://localhost:3000/users")
      .then((r) =>
        setUsers(r.data)
      );

    loadHistory();

  }, []);

  const checkIn =
    async () => {

      await axios.post(
        "http://localhost:3000/attendances/check-in",
        { userId }
      );

      message.success(
        "Entrada registrada"
      );

      loadHistory();
    };

  const checkOut =
    async () => {

      await axios.post(
        "http://localhost:3000/attendances/check-out",
        { userId }
      );

      message.success(
        "Salida registrada"
      );

      loadHistory();
    };

  return (
    <Card title="Marcaciones">

      <Select
        style={{
          width: 300,
          marginBottom: 20,
        }}
        placeholder="Seleccione empleado"
        onChange={setUserId}
        options={users.map(
          (u: any) => ({
            label: u.name,
            value: u.id,
          })
        )}
      />

      <br />

      <Button
        type="primary"
        onClick={checkIn}
      >
        Registrar Entrada
      </Button>

      <Button
        danger
        style={{
          marginLeft: 10,
        }}
        onClick={checkOut}
      >
        Registrar Salida
      </Button>

      <Table
        rowKey="id"
        style={{
          marginTop: 20,
        }}
        dataSource={history}
        columns={[
          {
            title: "Empleado",
            render: (_: any, r: any) =>
              r.user.name,
          },
          {
            title: "Entrada",
            dataIndex: "checkIn",
          },
          {
            title: "Salida",
            dataIndex: "checkOut",
          },
        ]}
      />

    </Card>
  );
}