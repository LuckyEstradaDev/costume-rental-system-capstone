export const RENTAL_RETURN_WINDOW_DAYS = 5;
export const RENTAL_PICKUP_LEAD_DAYS = 14;

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getReturnDate = (eventDate: Date | string) =>
  addDays(new Date(eventDate), RENTAL_RETURN_WINDOW_DAYS);

export const getRecommendedPickupDate = (eventDate: Date | string) =>
  addDays(new Date(eventDate), -RENTAL_PICKUP_LEAD_DAYS);
