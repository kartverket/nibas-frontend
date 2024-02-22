export const createUniqueIshValue = (length: number) => {
  const UTF_16_MAX_CHAR_POINT = 65535;
  let tmp = "";

  for (let i = 0; i < length; i++) {
    tmp += String.fromCharCode(Math.floor(Math.random() * UTF_16_MAX_CHAR_POINT));
  }

  return tmp;
};
