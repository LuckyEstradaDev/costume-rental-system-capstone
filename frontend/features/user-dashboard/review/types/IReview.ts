export interface IReview {
  _id?: string;
  outfitID: string;
  userID: string;
  userSnapshot?: {
    fullname: string;
  };
  stars: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
