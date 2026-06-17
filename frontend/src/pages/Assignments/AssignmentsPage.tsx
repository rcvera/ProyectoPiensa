import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Popconfirm,
  Typography,
  Badge,
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
      width: 180,
      render: (_: any, r: any) => (
        <div>
          <div
            style={{
              fontWeight: 600,
            }}
          >
            {r.name}
          </div>
          <Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            {r.position || r.role}
          </Text>
        </div>
      ),
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
          <Space>
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
    </>
  );
}
