export { API_URL as API_BASE } from "../api/config";

export const INCIDENT_TYPES = [
  {
    value: "ACCIDENTE",
    label: "Accidente",
  },
  {
    value: "DANO_VEHICULO",
    label: "Daño a vehículo",
  },
  {
    value: "FALTA_INSUMO",
    label: "Falta de insumo",
  },
  {
    value: "CONFLICTO",
    label: "Conflicto",
  },
  {
    value: "OTRO",
    label: "Otro",
  },
];

export const INCIDENT_STATUS = [
  {
    value: "PENDIENTE",
    label: "Pendiente",
    color: "orange",
  },
  {
    value: "REVISADO",
    label: "Revisado",
    color: "blue",
  },
  {
    value: "CERRADO",
    label: "Cerrado",
    color: "green",
  },
];

export const getTypeLabel = (
  value: string,
) =>
  INCIDENT_TYPES.find(
    (t) => t.value === value,
  )?.label || value;

export const getStatusMeta = (
  value: string,
) =>
  INCIDENT_STATUS.find(
    (s) => s.value === value,
  ) || {
    value,
    label: value,
    color: "default",
  };
