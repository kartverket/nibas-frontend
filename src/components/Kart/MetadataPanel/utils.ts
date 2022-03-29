export const getDateInFriendlyString = (dateString?: string) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

export const getDateStringFromISOString = (dateString: string) =>
  dateString.replace(/T.+$/g, "");

export const getDateStringToUTC = (dateString?: string) => {
  if (!dateString) return "";

  return new Date(dateString).toISOString();
};
