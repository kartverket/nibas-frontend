import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, Link, Text } from "@kvib/react";
import Input from "components/Input";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useKommunerByIds } from "hooks/inndelinger/useKommuner";
import { BaseSyntheticEvent, useEffect, useMemo, useState } from "react";
import { RegisterOptions, useForm } from "react-hook-form";
import { styled } from "styled-components";
import { KommuneResponse } from "types/api";
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

const SuggestionsContainer = styled.div`
  display: flex;
  margin-top: 10px;

  :not(:last-child) {
    margin-right: 8px;
  }

  a:not(:last-child)::after {
    content: ",";
  }
`;

type KommuneOption = Omit<InndelingOption, "type" | "representasjonspunkt"> & { type: "KOMMUNE" };
export type Eiendom = {
  kommune: KommuneOption | null;
  gaardsnummer: number | null;
  bruksnummer: number | null;
  festenummer: number | null;
};

export const EiendomSearch = ({ onSearchSuccess }: SearchProps) => {
  const { getAllInndelinger } = useInndelinger();
  const { gyldighetsdato } = useValgtGyldighetsdato();

  const { data: kommuner } = useKommunerByIds(
    getAllInndelinger().map((inndeling) => inndeling.id),
    gyldighetsdato,
  );

  // Må bruke memo her da vi kaller map på kommuner, map skaper en ny referanse for den resulterende lista og dermed evig rerender selv om kommunen er den samme.
  const suggestedKommunerInndelingOptions = useMemo(() => {
    const getKommuneOptionForKommuneResponse = ({ id, navn, nummer }: KommuneResponse): KommuneOption => {
      const adminNavn = navn.sort((n) => n.rekkefoelge ?? -1)[0].navn;
      return {
        id: id.lokalid.value,
        navn: adminNavn,
        nummer,
        type: "KOMMUNE",
        label: `${nummer} ${adminNavn}`,
      };
    };
    return kommuner?.map(getKommuneOptionForKommuneResponse) ?? [];
  }, [kommuner]);

  const {
    register,
    handleSubmit,
    clearErrors,
    setValue,
    reset,
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

  // Bruker useForm sin reset til å sette form-verdier når kommuner har blitt fetchet
  useEffect(() => {
    const getDefaultSuggestedKommune = () => {
      if (suggestedKommunerInndelingOptions != null && suggestedKommunerInndelingOptions.length === 1) {
        return suggestedKommunerInndelingOptions[0];
      } else {
        return null;
      }
    };
    reset((formValues) => ({
      ...formValues, // hvis cachen til kommuner fetcher på nytt i det man fyller ut formet har vi ikke lyst til at bruker mister sine eksisterende data i andre felt
      kommune: formValues.kommune != null ? formValues.kommune : getDefaultSuggestedKommune(),
    }));
  }, [kommuner, reset, suggestedKommunerInndelingOptions]);

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
    const result = await searchForEiendom(eiendom);
    if (result != null) {
      setNotFound(false);
      const eiendomRepresentasjonspunkt = result.features.find((feature) => feature.geometry.type === "Point");
      if (eiendomRepresentasjonspunkt != null) {
        const coords = eiendomRepresentasjonspunkt.geometry.coordinates;
        if (coords.length === 2) {
          centerOnCoordinate(Number(coords[1]), Number(coords[0]));
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
        onSelectInndeling={() => {
          clearErrors("kommune");
          setNotFound(false);
        }}
        validationError={{
          showError: !!formErrors.kommune,
          message: formErrors.kommune?.message ?? "",
        }}
      />
      {suggestedKommunerInndelingOptions != null && suggestedKommunerInndelingOptions.length > 1 && (
        <SuggestionsContainer>
          <Text>Forslag:</Text>
          {suggestedKommunerInndelingOptions.map((kommuneSuggestion, i) => (
            <Link
              onClick={() => {
                setValue("kommune", kommuneSuggestion);
              }}
              key={i}
            >
              {kommuneSuggestion.label}
            </Link>
          ))}
        </SuggestionsContainer>
      )}
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
