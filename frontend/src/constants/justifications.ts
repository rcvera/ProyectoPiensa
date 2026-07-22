export { API_URL as API_BASE } from "../api/config";

export const JUSTIFICATION_TYPES = [
  {
    value: "ENFERMEDAD",
    label: "Enfermedad (con certificado)",
  },
  {
    value: "CALAMIDAD_DOMESTICA",
    label: "Calamidad doméstica",
  },
  {
    value: "LUTO",
    label: "Luto (fallecimiento de familiar)",
  },
  {
    value: "OTRO",
    label: "Otro",
  },
];

export const JUSTIFICATION_STATUS = [
  {
    value: "PENDIENTE",
    label: "Pendiente",
    color: "orange",
  },
  {
    value: "APROBADA",
    label: "Aprobada",
    color: "green",
  },
  {
    value: "RECHAZADA",
    label: "Rechazada",
    color: "red",
  },
];

export const getTypeLabel = (
  value: string,
) =>
  JUSTIFICATION_TYPES.find(
    (t) => t.value === value,
  )?.label || value;

export const getStatusMeta = (
  value: string,
) =>
  JUSTIFICATION_STATUS.find(
    (s) => s.value === value,
  ) || {
    value,
    label: value,
    color: "default",
  };
