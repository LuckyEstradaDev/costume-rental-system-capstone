import {sessionAuthenticationService} from "@/features/auth/services/authService";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {INotification} from "../types/INotification";
import {markNotificationAsReadService} from "../services/notificationService";

export function useUserNotification() {
  const queryClient = useQueryClient();

  const {data} = useQuery({
    queryKey: ["user-notification"],
    queryFn: sessionAuthenticationService,
  });

  const {mutate: markAsRead} = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsReadService(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["user-notification"]});
    },
  });

  const notifications: INotification[] = data?.data?.user?.notifications ?? [];

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  return {notifications, unreadCount, markAsRead};
}
