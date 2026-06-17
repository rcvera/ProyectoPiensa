import {
  Badge,
  Dropdown,
  List,
  Button,
  Empty,
  Typography,
  Space,
} from "antd";

import {
  BellOutlined,
} from "@ant-design/icons";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import notificationsService
  from "../services/notifications.service";

const { Text } = Typography;

const formatRelative = (
  iso: string,
): string => {

  const diff =
    Date.now() - new Date(iso).getTime();

  const minutes = Math.floor(
    diff / 60000,
  );

  if (minutes < 1) return "ahora";
  if (minutes < 60)
    return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
};

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  incidentId?: string;
}

export default function NotificationsBell() {

  const navigate = useNavigate();

  const [count, setCount] =
    useState<number>(0);

  const [items, setItems] =
    useState<NotificationItem[]>([]);

  const [open, setOpen] =
    useState(false);

  const loadCount = async () => {
    try {
      const c =
        await notificationsService.unreadCount();
      setCount(c);
    } catch {
      /* silent */
    }
  };

  const loadItems = async () => {
    try {
      const data =
        await notificationsService.list();
      setItems(
        (data || []).slice(0, 10),
      );
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    loadCount();
    const interval = setInterval(
      loadCount,
      30000,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      loadItems();
    }
  }, [open]);

  const onClickItem = async (
    n: NotificationItem,
  ) => {
    try {
      if (!n.read) {
        await notificationsService.markRead(
          n.id,
        );
      }
    } catch {
      /* silent */
    }
    setOpen(false);
    loadCount();
    if (n.incidentId) {
      navigate(
        `/incidents/${n.incidentId}`,
      );
    }
  };

  const onMarkAll = async () => {
    try {
      await notificationsService.markAllRead();
      loadCount();
      loadItems();
    } catch {
      /* silent */
    }
  };

  const dropdownContent = (
    <div
      style={{
        width: 360,
        background: "#fff",
        boxShadow:
          "0 4px 16px rgba(0,0,0,0.12)",
        borderRadius: 8,
        padding: 8,
      }}
    >

      <Space
        style={{
          width: "100%",
          justifyContent:
            "space-between",
          padding: "4px 8px",
        }}
      >
        <Text strong>Notificaciones</Text>
        {items.some((i) => !i.read) && (
          <Button
            type="link"
            size="small"
            onClick={onMarkAll}
          >
            Marcar todas leídas
          </Button>
        )}
      </Space>

      {items.length === 0 ? (
        <Empty
          image={
            Empty.PRESENTED_IMAGE_SIMPLE
          }
          description="Sin notificaciones"
        />
      ) : (
        <List
          size="small"
          dataSource={items}
          renderItem={(n) => (
            <List.Item
              style={{
                cursor: "pointer",
                background: n.read
                  ? "transparent"
                  : "#f0f7ff",
                padding: 8,
                borderRadius: 4,
              }}
              onClick={() =>
                onClickItem(n)
              }
            >
              <List.Item.Meta
                title={n.title}
                description={
                  <Space
                    direction="vertical"
                    size={0}
                  >
                    <Text type="secondary">
                      {n.message}
                    </Text>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                      }}
                    >
                      {formatRelative(
                        n.createdAt,
                      )}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}

    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => dropdownContent}
    >
      <Badge
        count={count}
        size="small"
        offset={[-2, 4]}
      >
        <Button
          type="text"
          icon={
            <BellOutlined
              style={{ fontSize: 20 }}
            />
          }
        />
      </Badge>
    </Dropdown>
  );
}
