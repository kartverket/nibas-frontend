export const processFormValuesToCommonNull = <T extends Record<string, unknown>>(form: T): T => {
  let processedForm = form;
  for (const [key, value] of Object.entries(form)) {
    if (
      value === "" ||
      Number.isNaN(value) ||
      value === false ||
      value === null ||
      (Array.isArray(value) && value.length === 0)
    ) {
      processedForm = { ...processedForm, [key]: null };
    }
  }
  return processedForm;
};
