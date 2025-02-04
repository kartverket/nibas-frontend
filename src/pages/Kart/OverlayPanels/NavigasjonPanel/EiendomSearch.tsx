import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button } from "@kvib/react";
import Input from "components/Input";
import { BaseSyntheticEvent, useState } from "react";
import { RegisterOptions, useForm } from "react-hook-form";
import { styled } from "styled-components";
import { InndelingOption, InndelingSearchField } from "./InndelingSearchField";
import { centerOnCoordinate, SearchProps } from "./NavigasjonPanel";
import { useEiendom } from "./useEiendom";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 28px;
`;

const InputContainer = styled.div`
  display: flex;
  column-gap: 16px;
  margin: 22px 0 28px;
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
`;

export type Eiendom = {
  kommune: InndelingOption | null;
  gaardsnummer: number | null;
  bruksnummer: number | null;
  festenummer: number | null;
};

export const EiendomSearch = ({ onSearchSuccess }: SearchProps) => {
  const {
    register,
    handleSubmit,
    clearErrors,
    control,
    formState: { errors: formErrors, isDirty },
  } = useForm<Eiendom>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      kommune: null,
      gaardsnummer: null,
      bruksnummer: null,
      festenummer: null,
    },
  });
  const { searchForEiendom, isLoading } = useEiendom();
  const [notFound, setNotFound] = useState<boolean>(false);

  const eiendomFieldValidator: Partial<Record<keyof Eiendom, RegisterOptions>> = {
    kommune: { required: "Du må oppgi en kommune for eiendommen" },
    gaardsnummer: { required: "Du må oppgi et gårdsnummer for eiendommen" },
    bruksnummer: { required: "Du må oppgi et bruksnummer for eiendommen" },
  };

  const registerWithClearErrorsOnChange = (field: keyof Eiendom) => {
    const { onChange, ...rest } = register(field, eiendomFieldValidator[field]);
    const handleOnChange = (event: BaseSyntheticEvent<InputEvent>) => {
      clearErrors(field);
      setNotFound(false);
      return onChange(event);
    };

    return {
      onChange: handleOnChange,
      ...rest,
    };
  };

  const handleSearch = async (eiendom: Eiendom) => {
    console.log(eiendom);
    const result = await searchForEiendom(eiendom);
    if (result != null) {
      setNotFound(false);
      const eiendomRepresentasjonspunkt = result.features.find((feature) => feature.geometry.type === "Point");
      if (eiendomRepresentasjonspunkt != null) {
        const coords = eiendomRepresentasjonspunkt.geometry.coordinates;
        if (coords.length === 2) {
          centerOnCoordinate(Number(coords[0]), Number(coords[1]));
          onSearchSuccess();
        }
      } else {
        setNotFound(true);
      }
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit(handleSearch)}>
      <InndelingSearchField
        label="Kommune"
        fieldName="kommune"
        control={control}
        rules={eiendomFieldValidator["kommune"]}
        inndelingstypeFilter={["KOMMUNE"]}
        clearErrorsOnChange={() => {
          clearErrors("kommune");
          setNotFound(false);
        }}
        validationError={{
          showError: !!formErrors.kommune,
          message: formErrors.kommune?.message ?? "",
        }}
      />
      <InputContainer>
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
      </InputContainer>

      {notFound === true && (
        <StyledAlert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Fant ingen eiendommer med oppgitt matrikkelnummer</AlertTitle>
            <AlertDescription>
              Dobbeltsjekk at du har skrevet inn korrekt matrikkelnummer eller har valgt riktig kommune.
            </AlertDescription>
          </Box>
        </StyledAlert>
      )}

      <StyledButton type="submit" isDisabled={!isDirty} isLoading={isLoading}>
        Gå til eiendom
      </StyledButton>
    </StyledForm>
  );
};
