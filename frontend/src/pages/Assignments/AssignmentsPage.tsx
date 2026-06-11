import {
  Card,
  Button,
  Table,
} from "antd";

import {
  useState,
  useEffect,
} from "react";

import axios from "axios";

import AssignmentModal from "./AssignmentModal";

export default function AssignmentsPage() {

  const [open, setOpen] =
    useState(false);

  const [data, setData] =
    useState([]);

  const load = async () => {

    const response =
      await axios.get(
        "http://localhost:3000/assignments"
      );

    setData(
      response.data
    );
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Card
        title="Asignación de Turnos"
        extra={
          <Button
            type="primary"
            onClick={() =>
              setOpen(true)
            }
          >
            Asignar Turno
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={data}
          columns={[
            {
              title: "Empleado",
              render: (_: any, r: any) =>
                r.user.name,
            },
            {
              title: "Turno",
              render: (_: any, r: any) =>
                r.shift.name,
            },
            {
              title: "Entrada",
              render: (_: any, r: any) =>
                r.shift.startTime,
            },
            {
              title: "Salida",
              render: (_: any, r: any) =>
                r.shift.endTime,
            },
          ]}
        />
      </Card>

      <AssignmentModal
        open={open}
        onClose={() =>
          setOpen(false)
        }
        reload={load}
      />
    </>
  );
}