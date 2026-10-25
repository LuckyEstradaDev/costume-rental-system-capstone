const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

export const normalizeReferenceID = (identifier: string) =>
  identifier.trim().toUpperCase();

export const isObjectId = (identifier: string) =>
  OBJECT_ID_PATTERN.test(identifier.trim());

export const entityIdentifierFilter = (identifier: string) => {
  const value = identifier.trim();
  const referenceID = normalizeReferenceID(value);

  return isObjectId(value)
    ? {$or: [{_id: value}, {referenceID}]}
    : {referenceID};
};
