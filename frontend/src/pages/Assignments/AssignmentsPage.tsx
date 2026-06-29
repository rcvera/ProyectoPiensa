import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Popconfirm,
  Typography,
  Badge,
  Modal,
  Select,
  Checkbox,
  Divider,
  message,
} from "antd";

import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  EditOutlined,
  HolderOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  ClearOutlined,
} from "@ant-design/icons";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  createContext,
  useContext,
} from "react";

import { api } from "../../services/auth.service";

import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import utc from "dayjs/plugin/utc";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";

import type { DragEndEvent } from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import AssignmentModal from "./AssignmentModal";

dayjs.extend(isoWeek);
dayjs.extend(utc);

const { Text } = Typography;

const DAY_LABELS = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
];

const SHIFT_COLORS = [
  "#1677ff",
  "#fa8c16",
  "#52c41a",
  "#722ed1",
  "#eb2f96",
  "#13c2c2",
  "#f5222d",
];

const ORDER_STORAGE_KEY =
  "assignments:userOrder";

const getShiftColor = (
  shiftId: string,
  shifts: any[],
) => {
  const idx = shifts.findIndex(
    (s) => s.id === shiftId,
  );
  return SHIFT_COLORS[
    idx % SHIFT_COLORS.length
  ];
};

const startOfWeek = (
  d: Dayjs,
): Dayjs =>
  d
    .startOf("isoWeek")
    .startOf("day");

const loadOrder = (): string[] => {
  try {
    const raw = localStorage.getItem(
      ORDER_STORAGE_KEY,
    );
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveOrder = (ids: string[]) => {
  localStorage.setItem(
    ORDER_STORAGE_KEY,
    JSON.stringify(ids),
  );
};

const applyOrder = (
  list: any[],
  order: string[],
): any[] => {
  const map = new Map(
    list.map((u) => [u.id, u]),
  );
  const ordered: any[] = [];
  for (const id of order) {
    const u = map.get(id);
    if (u) {
      ordered.push(u);
      map.delete(id);
    }
  }
  return [...ordered, ...map.values()];
};

const RowContext = createContext<{
  setActivatorNodeRef?: (
    el: HTMLElement | null,
  ) => void;
  listeners?: any;
}>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } =
    useContext(RowContext);
  return (
    <span
      ref={
        setActivatorNodeRef as any
      }
      {...(listeners || {})}
      style={{
        cursor: "grab",
        color: "#999",
        padding: 4,
        display: "inline-flex",
        alignItems: "center",
        touchAction: "none",
      }}
    >
      <HolderOutlined />
    </span>
  );
};

interface SortableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key"?: string;
}

const SortableRow: React.FC<
  SortableRowProps
> = (props) => {
  const rowKey = props["data-row-key"];

  if (!rowKey) {
    return <tr {...props} />;
  }

  return <SortableRowInner {...props} rowKey={rowKey} />;
};

const SortableRowInner: React.FC<
  SortableRowProps & { rowKey: string }
> = ({ rowKey, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowKey });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(
      transform,
    ),
    transition,
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 9999,
          background: "#fafafa",
        }
      : {}),
  };

  const contextValue = useMemo(
    () => ({
      setActivatorNodeRef,
      listeners,
    }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider
      value={contextValue}
    >
      <tr
        {...props}
        ref={setNodeRef}
        style={style}
        {...attributes}
      />
    </RowContext.Provider>
  );
};

export default function AssignmentsPage() {

  const [weekStart, setWeekStart] =
    useState<Dayjs>(
      startOfWeek(dayjs()),
    );

  const [users, setUsers] =
    useState<any[]>([]);

  const [shifts, setShifts] =
    useState<any[]>([]);

  const [assignments, setAssignments] =
    useState<any[]>([]);

  const [publishing, setPublishing] =
    useState(false);

  const [filling, setFilling] =
    useState(false);

  const [copying, setCopying] =
    useState(false);

  const [clearing, setClearing] =
    useState(false);

  const [fillModalOpen, setFillModalOpen] =
    useState(false);

  const [selectedFillShift, setSelectedFillShift] =
    useState<string | undefined>();

  const [selectedFillUsers, setSelectedFillUsers] =
    useState<string[]>([]);

  // ISO weekdays: 1=Lun…7=Dom. Default: Lun–Vie (1–5)
  const [selectedFillDays, setSelectedFillDays] =
    useState<number[]>([1, 2, 3, 4, 5]);

  const [modalState, setModalState] =
    useState<{
      open: boolean;
      userId?: string;
      date?: string;
      currentShiftId?: string;
    }>({ open: false });

  const orderRef = useRef<string[]>(
    loadOrder(),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const days = useMemo(
    () =>
      Array.from({ length: 7 }).map(
        (_, i) => weekStart.add(i, "day"),
      ),
    [weekStart],
  );

  const weekEnd = useMemo(
    () => weekStart.add(6, "day"),
    [weekStart],
  );

  const draftCount = useMemo(
    () =>
      assignments.filter(
        (a) => !a.published,
      ).length,
    [assignments],
  );

  const publishedCount = useMemo(
    () =>
      assignments.filter(
        (a) => a.published,
      ).length,
    [assignments],
  );

  const loadStatic = async () => {

    const [u, s] = await Promise.all([
      api.get("/users"),
      api.get("/shifts"),
    ]);

    const activeUsers = (u.data || []).filter(
      (x: any) => x.active !== false,
    );

    setUsers(
      applyOrder(
        activeUsers,
        orderRef.current,
      ),
    );

    setShifts(s.data || []);
  };

  const loadAssignments = async () => {

    const from = weekStart.format(
      "YYYY-MM-DD",
    );

    const to = weekEnd.format(
      "YYYY-MM-DD",
    );

    const r = await api.get(
      "/assignments",
      {
        params: { from, to },
      },
    );

    setAssignments(r.data || []);
  };

  useEffect(() => {
    loadStatic();
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [weekStart]);

  const getCell = (
    userId: string,
    date: Dayjs,
  ) => {
    const dateStr = date.format(
      "YYYY-MM-DD",
    );
    return assignments.find(
      (a) =>
        a.userId === userId &&
        dayjs.utc(a.date).format(
          "YYYY-MM-DD",
        ) === dateStr,
    );
  };

  const openModal = (
    userId: string,
    date: Dayjs,
    currentShiftId?: string,
  ) =>
    setModalState({
      open: true,
      userId,
      date: date.format("YYYY-MM-DD"),
      currentShiftId,
    });

  const closeModal = () =>
    setModalState({ open: false });

  const removeAssignment = async (
    id: string,
  ) => {
    try {
      await api.delete(
        `/assignments/${id}`,
      );
      message.success(
        "Asignación eliminada",
      );
      loadAssignments();
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          "Error al eliminar",
      );
    }
  };

  const publishWeek = async () => {

    if (draftCount === 0) {
      message.info(
        "No hay cambios para publicar",
      );
      return;
    }

    try {
      setPublishing(true);

      const r = await api.post(
        "/assignments/publish",
        {
          from: weekStart.format(
            "YYYY-MM-DD",
          ),
          to: weekEnd.format(
            "YYYY-MM-DD",
          ),
        },
      );

      message.success(
        `Semana publicada: ${r.data.publishedCount} cambios, ${r.data.notifiedUsers} empleados notificados`,
      );

      loadAssignments();

    } catch {
      message.error(
        "Error al publicar",
      );
    } finally {
      setPublishing(false);
    }
  };

  const clearRow = async (userId: string) => {
    try {
      const r = await api.post("/assignments/clear-week", {
        from: weekStart.format("YYYY-MM-DD"),
        to: weekEnd.format("YYYY-MM-DD"),
        userIds: [userId],
      });
      message.success(`${r.data.deleted} asignaciones eliminadas`);
      loadAssignments();
    } catch {
      message.error("Error al limpiar la fila");
    }
  };

  const clearWeek = async () => {
    try {
      setClearing(true);
      const r = await api.post("/assignments/clear-week", {
        from: weekStart.format("YYYY-MM-DD"),
        to: weekEnd.format("YYYY-MM-DD"),
      });
      message.success(`${r.data.deleted} asignaciones eliminadas`);
      loadAssignments();
    } catch {
      message.error("Error al limpiar la semana");
    } finally {
      setClearing(false);
    }
  };

  const fillWeek = async () => {
    if (!selectedFillShift) {
      message.warning("Seleccioná un turno");
      return;
    }
    if (selectedFillDays.length === 0) {
      message.warning("Seleccioná al menos un día");
      return;
    }
    try {
      setFilling(true);
      const r = await api.post("/assignments/fill-week", {
        shiftId: selectedFillShift,
        from: weekStart.format("YYYY-MM-DD"),
        to: weekEnd.format("YYYY-MM-DD"),
        userIds: selectedFillUsers.length > 0 ? selectedFillUsers : undefined,
        isoDays: selectedFillDays,
      });
      message.success(
        `${r.data.created} asignaciones creadas${r.data.skipped > 0 ? `, ${r.data.skipped} ya existían` : ""}`,
      );
      setFillModalOpen(false);
      setSelectedFillShift(undefined);
      setSelectedFillUsers([]);
      setSelectedFillDays([1, 2, 3, 4, 5]);
      loadAssignments();
    } catch {
      message.error("Error al rellenar la semana");
    } finally {
      setFilling(false);
    }
  };

  const copyWeek = async () => {
    try {
      setCopying(true);
      const r = await api.post("/assignments/copy-week", {
        from: weekStart.format("YYYY-MM-DD"),
        to: weekEnd.format("YYYY-MM-DD"),
      });
      if (r.data.created === 0) {
        message.info("La semana anterior no tenía asignaciones para copiar");
      } else {
        message.success(
          `${r.data.created} asignaciones copiadas de la semana anterior`,
        );
      }
      loadAssignments();
    } catch {
      message.error("Error al copiar la semana");
    } finally {
      setCopying(false);
    }
  };

  const onDragEnd = (
    event: DragEndEvent,
  ) => {
    const { active, over } = event;
    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }
    setUsers((prev) => {
      const oldIndex = prev.findIndex(
        (u) => u.id === active.id,
      );
      const newIndex = prev.findIndex(
        (u) => u.id === over.id,
      );
      const next = arrayMove(
        prev,
        oldIndex,
        newIndex,
      );
      const ids = next.map((u) => u.id);
      orderRef.current = ids;
      saveOrder(ids);
      return next;
    });
  };

  const columns = [
    {
      title: "",
      key: "drag",
      width: 40,
      align: "center" as const,
      render: () => <DragHandle />,
    },
    {
      title: "Empleado",
      dataIndex: "name",
      fixed: "left" as const,
      width: 200,
      render: (_: any, r: any) => {
        const hasAssignments = assignments.some((a) => a.userId === r.id);
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.name}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.position?.name || r.role}
              </Text>
            </div>
            {hasAssignments && (
              <Popconfirm
                title={`¿Borrar toda la semana de ${r.name}?`}
                okText="Borrar"
                okButtonProps={{ danger: true }}
                cancelText="No"
                onConfirm={() => clearRow(r.id)}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  style={{ flexShrink: 0 }}
                />
              </Popconfirm>
            )}
          </div>
        );
      },
    },
    ...days.map((d, idx) => ({
      title: (
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div>{DAY_LABELS[idx]}</div>
          <div
            style={{
              fontSize: 11,
              color: "#888",
            }}
          >
            {d.format("DD/MM")}
          </div>
        </div>
      ),
      key: d.format("YYYY-MM-DD"),
      align: "center" as const,
      render: (_: any, r: any) => {
        const cell = getCell(r.id, d);
        if (cell) {
          const color = getShiftColor(
            cell.shiftId,
            shifts,
          );
          return (
            <Space
              direction="vertical"
              size={2}
              style={{ width: "100%" }}
            >
              <Tag
                color={color}
                icon={
                  cell.published ? null : (
                    <EditOutlined />
                  )
                }
                style={{
                  cursor: "pointer",
                  margin: 0,
                  fontWeight: 600,
                  opacity: cell.published
                    ? 1
                    : 0.55,
                  border: cell.published
                    ? "none"
                    : "1px dashed #999",
                }}
                onClick={() =>
                  openModal(
                    r.id,
                    d,
                    cell.shiftId,
                  )
                }
              >
                {cell.shift?.name ||
                  "Turno"}
              </Tag>
              <Popconfirm
                title="¿Eliminar asignación?"
                onConfirm={() =>
                  removeAssignment(
                    cell.id,
                  )
                }
                okText="Sí"
                cancelText="No"
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={
                    <DeleteOutlined />
                  }
                  style={{
                    padding: 0,
                    fontSize: 11,
                  }}
                />
              </Popconfirm>
            </Space>
          );
        }
        return (
          <Button
            type="text"
            size="small"
            onClick={() =>
              openModal(r.id, d)
            }
            style={{
              color: "#bbb",
              padding: 0,
            }}
          >
            +
          </Button>
        );
      },
    })),
  ];

  return (
    <>
      <Card
        title={
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={() =>
                setWeekStart(
                  weekStart.subtract(
                    7,
                    "day",
                  ),
                )
              }
            />
            <Button
              icon={
                <CalendarOutlined />
              }
              onClick={() =>
                setWeekStart(
                  startOfWeek(dayjs()),
                )
              }
            >
              Hoy
            </Button>
            <Button
              icon={<RightOutlined />}
              onClick={() =>
                setWeekStart(
                  weekStart.add(7, "day"),
                )
              }
            />
            <Text strong>
              Semana del{" "}
              {weekStart.format("DD/MM")} al{" "}
              {weekEnd.format("DD/MM/YYYY")}
            </Text>
          </Space>
        }
        extra={
          <Space wrap>
            <Badge
              count={draftCount}
              overflowCount={99}
              size="small"
              offset={[-4, 0]}
            >
              <Text type="secondary">
                Borradores
              </Text>
            </Badge>
            <Text type="secondary">
              · Publicadas:{" "}
              {publishedCount}
            </Text>
            <Popconfirm
              title="¿Limpiar toda la semana?"
              description="Se eliminarán TODAS las asignaciones de la semana visible. Esta acción no se puede deshacer."
              okText="Limpiar"
              okButtonProps={{ danger: true }}
              cancelText="Cancelar"
              onConfirm={clearWeek}
            >
              <Button
                danger
                icon={<ClearOutlined />}
                loading={clearing}
              >
                Limpiar semana
              </Button>
            </Popconfirm>

            <Popconfirm
              title="¿Copiar asignaciones de la semana anterior?"
              description="Se copiarán los turnos de la semana pasada a esta semana. Las celdas con asignación existente no se modificarán."
              okText="Copiar"
              cancelText="Cancelar"
              onConfirm={copyWeek}
            >
              <Button
                icon={<CopyOutlined />}
                loading={copying}
              >
                Copiar semana anterior
              </Button>
            </Popconfirm>
            <Button
              icon={<ThunderboltOutlined />}
              onClick={() => {
                setSelectedFillShift(undefined);
                setSelectedFillUsers([]);
                setSelectedFillDays([1, 2, 3, 4, 5]);
                setFillModalOpen(true);
              }}
            >
              Rellenar semana
            </Button>
            <Button
              type="primary"
              icon={
                <CloudUploadOutlined />
              }
              loading={publishing}
              disabled={
                draftCount === 0
              }
              onClick={publishWeek}
            >
              Publicar semana
              {draftCount > 0
                ? ` (${draftCount})`
                : ""}
            </Button>
            <Button
              onClick={() =>
                setModalState({
                  open: true,
                })
              }
            >
              Asignar
            </Button>
          </Space>
        }
      >

        <DndContext
          sensors={sensors}
          collisionDetection={
            closestCenter
          }
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={users.map((u) => u.id)}
            strategy={
              verticalListSortingStrategy
            }
          >
            <Table
              rowKey="id"
              dataSource={users}
              columns={columns}
              pagination={false}
              scroll={{ x: "max-content" }}
              size="middle"
              components={{
                body: {
                  row: SortableRow,
                },
              }}
            />
          </SortableContext>
        </DndContext>

        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#888",
          }}
        >
          <Tag
            color="#1677ff"
            style={{
              border: "1px dashed #999",
              opacity: 0.55,
            }}
          >
            Borrador
          </Tag>{" "}
          = solo lo ves vos
          &nbsp;·&nbsp;
          <Tag color="#1677ff">
            Publicado
          </Tag>{" "}
          = visible para el empleado
          &nbsp;·&nbsp;
          Arrastrá el ícono{" "}
          <HolderOutlined />{" "}
          para reordenar empleados
        </div>

      </Card>

      <AssignmentModal
        open={modalState.open}
        onClose={closeModal}
        reload={loadAssignments}
        users={users}
        shifts={shifts}
        prefilledUserId={
          modalState.userId
        }
        prefilledDate={modalState.date}
        currentShiftId={
          modalState.currentShiftId
        }
      />

      <Modal
        title={
          <Space>
            <ThunderboltOutlined />
            Rellenar semana —{" "}
            {weekStart.format("DD/MM")} al {weekEnd.format("DD/MM/YYYY")}
          </Space>
        }
        open={fillModalOpen}
        onOk={fillWeek}
        onCancel={() => {
          setFillModalOpen(false);
          setSelectedFillShift(undefined);
          setSelectedFillUsers([]);
          setSelectedFillDays([1, 2, 3, 4, 5]);
        }}
        okText="Asignar"
        confirmLoading={filling}
        okButtonProps={{
          disabled: !selectedFillShift || selectedFillDays.length === 0,
        }}
        width={500}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>

          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Turno *</div>
            <Select
              style={{ width: "100%" }}
              placeholder="Seleccioná un turno..."
              value={selectedFillShift}
              onChange={setSelectedFillShift}
              options={shifts.map((s) => ({
                value: s.id,
                label: `${s.name}${s.startTime ? ` · ${s.startTime} – ${s.endTime}` : ""}`,
              }))}
            />
          </div>

          <Divider style={{ margin: "4px 0" }} />

          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Empleados{" "}
              <span style={{ fontWeight: 400, color: "#888" }}>
                (vacío = todos los activos)
              </span>
            </div>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Todos los empleados activos..."
              value={selectedFillUsers}
              onChange={setSelectedFillUsers}
              allowClear
              maxTagCount="responsive"
              options={users
                .filter((u) => u.active !== false)
                .map((u) => ({
                  value: u.id,
                  label: `${u.name}${u.position?.name ? ` · ${u.position.name}` : ""}`,
                }))}
            />
          </div>

          <Divider style={{ margin: "4px 0" }} />

          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Días de la semana *</div>
            <Checkbox.Group
              value={selectedFillDays}
              onChange={(vals) => setSelectedFillDays(vals as number[])}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Lun", value: 1 },
                  { label: "Mar", value: 2 },
                  { label: "Mié", value: 3 },
                  { label: "Jue", value: 4 },
                  { label: "Vie", value: 5 },
                  { label: "Sáb", value: 6 },
                  { label: "Dom", value: 7 },
                ].map((d) => (
                  <Checkbox key={d.value} value={d.value}>
                    {d.label}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <Button
                size="small"
                onClick={() => setSelectedFillDays([1, 2, 3, 4, 5])}
              >
                Lun–Vie
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedFillDays([1, 2, 3, 4, 5, 6, 7])}
              >
                Todos
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedFillDays([])}
              >
                Ninguno
              </Button>
            </div>
          </div>

          <div style={{ color: "#888", fontSize: 12 }}>
            Las celdas que ya tienen asignación no se modificarán.
          </div>
        </div>
      </Modal>
    </>
  );
}
