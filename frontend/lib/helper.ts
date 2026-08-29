export const sortArrayByLatestDate = <
  T extends {createdAt?: string | Date | null},
>(
  data: T[],
): T[] => {
  return [...data].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return dateB - dateA;
  });
};

export const sortArrayByEarliestDate = <
  T extends {createdAt?: string | Date | null},
>(
  data: T[],
): T[] => {
  return [...sortArrayByLatestDate(data)].reverse();
};
