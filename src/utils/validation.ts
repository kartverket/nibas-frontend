export const stringValidation = {
  isEmpty: (s: string) => s.trim() === "", // TODO: bør sjekke etter flere typer whitespace
  isInteger: (s: string) => s.match(/^[0-9]+$/) !== null,
};

export const numberValidation = {
  isPositive: (n: number) => n > 0,
  isBetween: (n: number, min: number, max: number) => n > min && n < max,
};
