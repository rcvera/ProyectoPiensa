export const SCALE_OPTIONS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

export const SURVEY_QUESTIONS = [
  {
    name: "hoursFeeling",
    label: "¿Cómo sientes la cantidad de horas trabajadas este mes?",
    lowLabel: "Muy manejable",
    highLabel: "Excesiva",
  },
  {
    name: "physicalLoad",
    label: "Carga física percibida",
    lowLabel: "Muy baja",
    highLabel: "Muy alta",
  },
  {
    name: "emotionalLoad",
    label: "Carga emocional / estrés percibido",
    lowLabel: "Muy bajo",
    highLabel: "Muy alto",
  },
];

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const formatMonthYear = (
  month: number,
  year: number,
) => `${MONTH_NAMES[month - 1] || month} ${year}`;

export const getSurveyStatus = (
  completedAt: string | null,
) =>
  completedAt
    ? { value: "COMPLETADA", label: "Completada", color: "green" }
    : { value: "PENDIENTE", label: "Pendiente", color: "orange" };
