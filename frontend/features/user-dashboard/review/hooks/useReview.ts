import {useCallback, useState} from "react";
import {IReview} from "../types/IReview";
import {getReviewsByUserId} from "../services/reviewService";

export function useReview() {
  const [userReviews, setUserReviews] = useState<IReview[]>([]);
  const getUserReviews = useCallback(async (userID: string) => {
    const response = await getReviewsByUserId(userID);
    setUserReviews(response.data);
  }, []);

  return {userReviews, getUserReviews};
}
