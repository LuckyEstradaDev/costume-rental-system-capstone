export interface IReview {
  outfitID: string;
  userID: string;
  userSnapshot: {
    fullname: string;
  };
  stars: number;
  comment?: string;
}
