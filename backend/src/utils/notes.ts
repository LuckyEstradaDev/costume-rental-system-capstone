export const normalizeNotes = (notes?: string | null) => {
  const value = notes?.trim();

  return value ? value.slice(0, 1000) : undefined;
};
