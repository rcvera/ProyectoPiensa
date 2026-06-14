import {
  Card,
  Table,
  Tag,
} from "antd";

import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

export default function OvertimesPage() {

  const [data, setData] =
    useState([]);

  useEffect(() => {

    axios
      .get(
        "http://localhost:3000/overtimes"
      )
      .then((r) =>
        setData(r.data)
      );

  }, []);

  return (
    <Card title="Horas Extras">

      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          {
            title:"Empleado",
            render:(_:any,r:any)=>
              r.user.name,
          },
          {
            title:"Horas Trabajadas",
            dataIndex:"workedHours",
          },
          {
            title:"Horas Extra",
            render:(_:any,r:any)=>(
              <Tag color="orange">
                {r.overtimeHours}
              </Tag>
            ),
          },
          {
            title:"Fecha",
            dataIndex:"date",
          },
        ]}
      />

    </Card>
  );
}