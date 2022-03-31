export const getDateInFriendlyString = (dateString?: string) => {
  if (!dateString) return null;

  const noTimezoneDateString = getDateStringFromISOString(dateString);

  const date = new Date(noTimezoneDateString);

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

export const getDateStringFromISOString = (dateString: string) =>
  dateString.replace(/T.+$/g, "");
