import { Inndelingtype } from "types/api";
import { Path, RegisterOptions, ValidateResult } from "react-hook-form";
import { capitalize } from "./string-utils";
import { isIntegerString } from "./type-utils";

const getCommonInndelingNumberValidator = <TForm extends Record<string, unknown>, TFieldName extends Path<TForm>>(
  inndelingType: Inndelingtype,
  minLength: number,
  maxLength: number,
  shouldNotBeEqualWith: string[],
  additionalValidation?: (number: string) => ValidateResult,
): RegisterOptions<TForm, TFieldName> => {
  const formattedInndelingType = getInndelingtypeLabel(inndelingType, {
    pluralizeLabel: false,
    capitalizeLabel: false,
  });
  const capitalizedInndelingType = capitalize(formattedInndelingType);
  return {
    required: `${capitalizedInndelingType}nummer kan ikke være tomt`,
    validate: (number) => {
      if (typeof number !== "string") {
        return true;
      }
      if (!isIntegerString(number)) {
        return `${capitalizedInndelingType}nummer kan kun inneholde siffer`;
      }
      if (parseInt(number) <= 0) {
        return `${capitalizedInndelingType}nummer kan ikke være 0 eller et negativt tall`;
      }
      if (!(number.length >= minLength && number.length <= maxLength)) {
        return `${capitalizedInndelingType}nummer må ha minst ${minLength} siffer og maks ${maxLength} siffer`;
      }
      if (shouldNotBeEqualWith.find((num) => num === number) != null) {
        return `${capitalizedInndelingType}nummer brukes allerede av ${inndelingType === "FYLKE" ? "et annet" : "en annen"} ${formattedInndelingType}`;
      }
      if (additionalValidation != null) {
        const additionalValidationResult = additionalValidation(number);
        if (additionalValidationResult !== true) {
          return additionalValidationResult;
        }
      }
      return true;
    },
  };
};

interface NumberValidatorConfig {
  shouldNotBeEqualWith: string[];
  additionalValidation?: (number: string) => ValidateResult;
  prefixNumber?: string;
}

export function getStemmekretsNumberValidator<TForm extends Record<string, unknown>, TFieldName extends Path<TForm>>({
  shouldNotBeEqualWith,
  additionalValidation,
}: NumberValidatorConfig): RegisterOptions<TForm, TFieldName> {
  return getCommonInndelingNumberValidator("STEMMEKRETS", 1, 4, shouldNotBeEqualWith, additionalValidation);
}

export function getBopliktomraadeNumberValidator<
  TForm extends Record<string, unknown>,
  TFieldName extends Path<TForm>,
>({ shouldNotBeEqualWith, additionalValidation }: NumberValidatorConfig): RegisterOptions<TForm, TFieldName> {
  return getCommonInndelingNumberValidator("BOPLIKTOMRAADE", 1, 4, shouldNotBeEqualWith, additionalValidation);
}
export function getGrunnkretsNumberValidator<TForm extends Record<string, unknown>, TFieldName extends Path<TForm>>({
  shouldNotBeEqualWith,
  additionalValidation,
  prefixNumber,
}: NumberValidatorConfig): RegisterOptions<TForm, TFieldName> {
  const { validate, ...rest } = getCommonInndelingNumberValidator<TForm, TFieldName>(
    "GRUNNKRETS",
    8,
    8,
    shouldNotBeEqualWith,
    additionalValidation,
  );

  return {
    ...rest,
    validate: (value, fields) => {
      if (typeof value !== "string") {
        return true;
      }

      if (prefixNumber != null && !value.startsWith(prefixNumber)) {
        return `Grunnkretsnummer må starte med kommunenummeret: ${prefixNumber}`;
      }
      if (typeof validate === "function") {
        const commonValidationResult = validate(value, fields);
        if (commonValidationResult !== true) {
          return commonValidationResult;
        }
      }
      return true;
    },
  };
}

export function getKommuneNumberValidator<TForm extends Record<string, unknown>, TFieldName extends Path<TForm>>({
  shouldNotBeEqualWith,
  additionalValidation,
  prefixNumber,
}: NumberValidatorConfig): RegisterOptions<TForm, TFieldName> {
  const { validate, ...rest } = getCommonInndelingNumberValidator<TForm, TFieldName>(
    "KOMMUNE",
    8,
    8,
    shouldNotBeEqualWith,
    additionalValidation,
  );

  return {
    ...rest,
    validate: (number, fields) => {
      if (typeof number !== "string") {
        return true;
      }
      if (prefixNumber != null && !number.startsWith(prefixNumber)) {
        return `Kommunenummeret må starte med fylkesnummeret: ${prefixNumber}`;
      }
      if (typeof validate === "function") {
        const commonValidationResult = validate(number, fields);
        if (commonValidationResult !== true) {
          return commonValidationResult;
        }
      }
      return true;
    },
  };
}

export function getFylkeNumberValidator<TForm extends Record<string, unknown>, TFieldName extends Path<TForm>>({
  shouldNotBeEqualWith,
  additionalValidation,
}: NumberValidatorConfig): RegisterOptions<TForm, TFieldName> {
  return getCommonInndelingNumberValidator("FYLKE", 1, 2, shouldNotBeEqualWith, additionalValidation);
}

export const getNumberValidatorFunctionForInndelingType = <
  TForm extends Record<string, unknown>,
  TFieldName extends Path<TForm>,
>(
  inndelingType: Inndelingtype,
): ((config: NumberValidatorConfig) => RegisterOptions<TForm, TFieldName>) => {
  switch (inndelingType) {
    case "FYLKE":
      return getFylkeNumberValidator;
    case "KOMMUNE":
      return getKommuneNumberValidator;
    case "STEMMEKRETS":
      return getStemmekretsNumberValidator;
    case "GRUNNKRETS":
      return getGrunnkretsNumberValidator;
    case "BOPLIKTOMRAADE": {
      return getBopliktomraadeNumberValidator;
    }
  }
};

export type GetInndelingtypeLabelOptions = {
  /**
   * Om label skal være i flertallsform (f.eks. "fylker" i stedet for "fylke")
   */
  pluralizeLabel?: boolean;
  /**
   * Om label skal ha stor forbokstav (f.eks. "Fylke" i stedet for "fylke")
   */
  capitalizeLabel?: boolean;
};

/**
 * Returnerer visningsstring for en inndelingstype til bruk i labels og tekster
 * @param inndelingtype Inndelingstype å returnere label for
 * @param options Options for labelen
 * @returns Visningsstring for inndelingstype (f.eks. "fylke", "kommune", "grunnkrets")
 */
export const getInndelingtypeLabel = (
  inndelingtype: Inndelingtype | null,
  options: GetInndelingtypeLabelOptions = {},
): string => {
  const { pluralizeLabel = false, capitalizeLabel = false } = options;

  if (inndelingtype == null) {
    return "";
  }
  let label = "";
  switch (inndelingtype) {
    case "FYLKE":
      label = pluralizeLabel ? "fylker" : "fylke";
      break;
    case "KOMMUNE":
      label = pluralizeLabel ? "kommuner" : "kommune";
      break;
    case "GRUNNKRETS":
      label = pluralizeLabel ? "grunnkretser" : "grunnkrets";
      break;
    case "STEMMEKRETS":
      label = pluralizeLabel ? "stemmekretser" : "stemmekrets";
      break;
    case "BOPLIKTOMRAADE":
      label = pluralizeLabel ? "bopliktområder" : "bopliktområde";
      break;
  }
  if (capitalizeLabel) {
    label = capitalize(label);
  }
  return label;
};
