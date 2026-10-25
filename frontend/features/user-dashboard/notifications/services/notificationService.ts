import {api} from "@/lib/axios";

export const markNotificationAsReadService = async (notificationId: string) => {
  const res = await api.patch(`/api/auth/me/notifications/${notificationId}/read`);
  return res.data;
};
