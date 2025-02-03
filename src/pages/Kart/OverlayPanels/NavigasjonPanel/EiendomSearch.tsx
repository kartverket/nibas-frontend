import { Button, FormControl, FormErrorMessage, FormLabel, InputGroup } from "@kvib/react";
import Input from "components/Input";
import { ChangeHandler, useForm } from "react-hook-form";
import { styled } from "styled-components";
import { InndelingOption, InndelingSearch } from "./InndelingSearch";
import { NavigasjonProps } from "./NavigasjonPanel";
import { useEiendom } from "./useEiendom";

const StyledFormControl = styled(FormControl)`
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  display: flex;
  column-gap: 16px;
  margin: 22px 0 28px;
`;

const StyledFormErrorMessage = styled(FormErrorMessage)`
  grid-column: 1 / -2;
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
`;

type EiendomForm = {
  kommune: InndelingOption | null;
  gaardsnummer: number | null;
  bruksnummer: number | null;
  festenummer: number | null;
  globalErrorDummyField: null;
};

export type Eiendom = Omit<EiendomForm, "globalErrorDummyField">;

export const EiendomSearch = ({ onSelect }: NavigasjonProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    formState: { isDirty, errors: formErrors },
  } = useForm<EiendomForm>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      kommune: null,
      gaardsnummer: null,
      bruksnummer: null,
      festenummer: null,
    },
  });
  const searchForEiendom = useEiendom();

  const registerWithClearErrorsOnChange = (field: keyof EiendomForm) => {
    const { onChange, ...rest } = register(field);
    const handleOnChange: ChangeHandler = (value) => {
      clearErrors(field);
      clearErrors("globalErrorDummyField");
      return onChange(value);
    };

    return {
      onChange: handleOnChange,
      ...rest,
    };
  };

  const handleSearch = async (eiendom: EiendomForm) => {
    console.log(eiendom);
    const result = await searchForEiendom(eiendom);
    if (result != null) {
      const eiendomRepresentasjonspunkt = result.features.find((feature) => feature.geometry.type === "Point");
      if (eiendomRepresentasjonspunkt != null) {
        const coords = eiendomRepresentasjonspunkt.geometry.coordinates;
        if (coords.length === 2) {
          onSelect(Number(coords[0]), Number(coords[1]));
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSearch)}>
      <StyledFormControl isInvalid={formErrors.globalErrorDummyField != null}>
        <FormLabel htmlFor="input">Kommune</FormLabel>
        <InndelingSearch
          onSelect={(kommune) => setValue("kommune", kommune)}
          isOpen={true}
          inndelingstypeFilter={["KOMMUNE"]}
        />
        <InputContainer>
          <InputGroup>
            <Input
              type="number"
              placeholder="Fyll inn gårdsnummer ..."
              label={"Gårdsnummer"}
              {...registerWithClearErrorsOnChange("gaardsnummer")}
              validationError={{
                showError: !!formErrors.gaardsnummer,
                message: formErrors.gaardsnummer?.message ?? "",
              }}
            />
          </InputGroup>
          {formErrors.gaardsnummer != null && (
            <StyledFormErrorMessage>{formErrors.gaardsnummer.message}</StyledFormErrorMessage>
          )}

          <InputGroup>
            <Input
              type="number"
              placeholder="Fyll inn bruksnummer ..."
              label={"Bruksnummer"}
              {...registerWithClearErrorsOnChange("bruksnummer")}
              validationError={{
                showError: !!formErrors.bruksnummer,
                message: formErrors.bruksnummer?.message ?? "",
              }}
            />
          </InputGroup>
          {formErrors.bruksnummer != null && (
            <StyledFormErrorMessage>{formErrors.bruksnummer.message}</StyledFormErrorMessage>
          )}

          <InputGroup>
            <Input
              type="number"
              placeholder="Fyll inn festenummer ..."
              label={"Festenummer (valgfritt)"}
              {...registerWithClearErrorsOnChange("festenummer")}
              validationError={{
                showError: !!formErrors.festenummer,
                message: formErrors.festenummer?.message ?? "",
              }}
            />
          </InputGroup>
          {formErrors.festenummer != null && (
            <StyledFormErrorMessage>{formErrors.festenummer.message}</StyledFormErrorMessage>
          )}
        </InputContainer>
        {formErrors.globalErrorDummyField != null && (
          <StyledFormErrorMessage>{formErrors.globalErrorDummyField.message}</StyledFormErrorMessage>
        )}
        <StyledButton type="submit" isDisabled={!isDirty}>
          Gå til eiendom
        </StyledButton>
      </StyledFormControl>
    </form>
  );
};
