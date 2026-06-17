import { api } from "./auth.service";

const list = async () => {

  const response =
    await api.get(
      "/notifications",
    );

  return response.data;
};

const unreadCount =
  async (): Promise<number> => {

    const response =
      await api.get(
        "/notifications/unread-count",
      );

    return (
      response.data?.count ?? 0
    );
  };

const markRead = async (
  id: string | number,
) => {

  const response =
    await api.patch(
      `/notifications/${id}/read`,
    );

  return response.data;
};

const markAllRead = async () => {

  const response =
    await api.patch(
      "/notifications/read-all",
    );

  return response.data;
};

export const notificationsService = {
  list,
  unreadCount,
  markRead,
  markAllRead,
};

export default notificationsService;
