import {sessionAuthenticationService} from "@/features/auth/services/authService";
import {useQuery} from "@tanstack/react-query";
import type {INotification} from "../types/INotification";

export function useUserNotification() {
  const {data} = useQuery({
    queryKey: ["user-notification"],
    queryFn: sessionAuthenticationService,
  });

  const notifications: INotification[] = data?.data?.user?.notifications ?? [];

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  return {notifications, unreadCount};
}
