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

import ShiftModal from "./ShiftModal";

export default function ShiftsPage() {

  const [open, setOpen] =
    useState(false);

  const [shifts, setShifts] =
    useState([]);

  const loadShifts =
    async () => {

      const response =
        await axios.get(
          "http://localhost:3000/shifts"
        );

      setShifts(
        response.data
      );
    };

  useEffect(() => {
    loadShifts();
  }, []);

  return (
    <>
      <Card
        title="Gestión de Turnos"
        extra={
          <Button
            type="primary"
            onClick={() =>
              setOpen(true)
            }
          >
            Nuevo Turno
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={[
            {
              title: "Nombre",
              dataIndex: "name",
            },
            {
              title: "Entrada",
              dataIndex: "startTime",
            },
            {
              title: "Salida",
              dataIndex: "endTime",
            },
            {
              title: "Días",
              dataIndex: "days",
            },
            {
              title: "Estado",
              render: (_: any, r: any) => (
                <Tag color="green">
                  Activo
                </Tag>
              ),
            },
          ]}
          dataSource={shifts}
        />
      </Card>

      <ShiftModal
        open={open}
        onClose={() =>
          setOpen(false)
        }
        reload={loadShifts}
      />
    </>
  );
}