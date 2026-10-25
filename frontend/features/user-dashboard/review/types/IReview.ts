export interface IReview {
  _id?: string;
  outfitID: string;
  orderID: string;
  userID: string;
  userSnapshot?: {
    fullname: string;
  };
  profilePicture?: string | null;
  stars: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
