export const safeParseJsonValue = (value: unknown) => {
  if (!value || typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
};
