import { Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { RegisterOptions } from "react-hook-form";
import { capitalize } from "./string-utils";
import { isIntegerString } from "./type-utils";

const getCommonInndelingNumberValidator = (
  inndelingType: Inndelingtype,
  minLength: number,
  maxLength: number,
  shouldNotBeEqualWith: string[],
): RegisterOptions => {
  const formattedInndelingType = capitalize(inndelingType);
  return {
    required: `${formattedInndelingType}nummer kan ikke være tomt`,
    validate: (number: string) => {
      if (!isIntegerString(number)) {
        return `${formattedInndelingType}nummer kan kun inneholde siffer`;
      }
      if (parseInt(number) <= 0) {
        return `${formattedInndelingType}nummer kan ikke være 0 eller et negativt tall`;
      }
      if (!(number.length >= minLength && number.length <= maxLength)) {
        return `${formattedInndelingType}nummer må ha minst ${minLength} siffer og maks ${maxLength} siffer`;
      }
      if (shouldNotBeEqualWith.find((num) => num === number) != null) {
        return `${formattedInndelingType}nummer brukes allerede av ${inndelingType === "fylke" ? "et annet" : "en annen"} ${inndelingType}`;
      }

      return true;
    },
  };
};

export const getStemmekretsNumberValidator = (shouldNotBeEqualWith: string[]): RegisterOptions => {
  return getCommonInndelingNumberValidator("stemmekrets", 1, 4, shouldNotBeEqualWith);
};

export const getGrunnkretsNumberValidator = (
  shouldNotBeEqualWith: string[],
  prefixNumber?: string,
): RegisterOptions => {
  const { validate, ...rest } = getCommonInndelingNumberValidator("grunnkrets", 8, 8, shouldNotBeEqualWith);
  return {
    ...rest,
    validate: (number: string, fields) => {
      if (prefixNumber != null && !number.startsWith(prefixNumber)) {
        return `Grunnkretsnummer må starte med kommunenummeret: ${prefixNumber}`;
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
};

export const getKommuneNumberValidator = (shouldNotBeEqualWith: string[], prefixNumber?: string): RegisterOptions => {
  const { validate, ...rest } = getCommonInndelingNumberValidator("kommune", 8, 8, shouldNotBeEqualWith);
  return {
    ...rest,
    validate: (number: string, fields) => {
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
};

export const getFylkeNumberValidator = (shouldNotBeEqualWith: string[]): RegisterOptions => {
  return getCommonInndelingNumberValidator("fylke", 1, 2, shouldNotBeEqualWith);
};

export const getNumberValidatorFunctionForInndelingType = (inndelingType: Inndelingtype) => {
  switch (inndelingType) {
    case "fylke": {
      return getFylkeNumberValidator;
    }
    case "kommune": {
      return getKommuneNumberValidator;
    }
    case "stemmekrets": {
      return getStemmekretsNumberValidator;
    }
    case "grunnkrets": {
      return getGrunnkretsNumberValidator;
    }
  }
};
