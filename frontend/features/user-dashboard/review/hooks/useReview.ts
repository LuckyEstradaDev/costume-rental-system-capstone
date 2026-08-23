import {useQuery} from "@tanstack/react-query";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {IReview} from "../types/IReview";
import {getReviewsByUserId} from "../services/reviewService";

export function useReview() {
  const {user} = useAuth();
  const userID = user?._id;
  const {data: userReviews = []} = useQuery({
    queryKey: ["user-reviews", userID],
    queryFn: async (): Promise<IReview[]> => {
      const response = await getReviewsByUserId(userID!);
      return response.data;
    },
    enabled: Boolean(userID),
  });

  return {userReviews};
}
