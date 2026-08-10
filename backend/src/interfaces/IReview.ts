export interface IReview {
  outfitID: string;
  orderID: string;
  userID: string;
  userSnapshot: {
    fullname: string;
  };
  stars: number;
  comment?: string;
}
