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
import { API_URL } from "../../api/config";

export default function OvertimesPage() {

  const [data, setData] =
    useState([]);

  useEffect(() => {

    axios
      .get(
        `${API_URL}/overtimes`
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
            render:(v:number)=>Number(v).toFixed(2),
          },
          {
            title:"Horas Extra",
            render:(_:any,r:any)=>(
              <Tag color="orange">
                {Number(r.overtimeHours).toFixed(2)}
              </Tag>
            ),
          },
          {
            title:"Recargo 50% (diurno)",
            render:(_:any,r:any)=>(
              <Tag color="gold">
                {Number(r.overtimeHours50 ?? 0).toFixed(2)}
              </Tag>
            ),
          },
          {
            title:"Recargo 100% (nocturno/fin de semana)",
            render:(_:any,r:any)=>(
              <Tag color="red">
                {Number(r.overtimeHours100 ?? 0).toFixed(2)}
              </Tag>
            ),
          },
          {
            title:"Fecha",
            dataIndex:"date",
            render:(date:string)=>
              new Date(date).toLocaleDateString("es-CL",{
                day:"2-digit",
                month:"2-digit",
                year:"numeric",
                hour:"2-digit",
                minute:"2-digit",
              }),
          },
        ]}
      />

    </Card>
  );
}