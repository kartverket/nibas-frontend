export const getDateInFriendlyString = (dateString?: string) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

export const getDateStringFromISOString = (dateString: string) =>
  dateString.replace(/T.+$/g, "");

export const getDateStringFromDateTime = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;

  return `${date.getFullYear()}-${month}-${date.getDate()}`;
};
