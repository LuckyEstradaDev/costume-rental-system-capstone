import {useAuth} from "@/features/auth/hooks/useAuth";
import {sessionAuthenticationService} from "@/features/auth/services/authService";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {INotification} from "../types/INotification";
import {markNotificationAsReadService} from "../services/notificationService";

export function useUserNotification(admin = false) {
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const queryKey = ["user-notification", user?._id];

  const {data} = useQuery({
    queryKey,
    queryFn: sessionAuthenticationService,
    enabled: Boolean(user?._id),
    refetchInterval: admin ? 30_000 : false,
  });

  const {mutate: markAsRead} = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsReadService(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey});
    },
  });

  const notifications: INotification[] = data?.data?.user?.notifications ?? [];

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  return {notifications, unreadCount, markAsRead};
}
