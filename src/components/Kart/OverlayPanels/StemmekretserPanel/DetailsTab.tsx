import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Input from "components/form/Input";
import { StemmekretsEntry, useToolbarSaving } from "contexts/ToolbarContext";
import useKretsToolbarSync from "contexts/ToolbarContext/useToolbarFormSync";
import { StemmekretsRequest, StemmekretsResponse } from "types/api";
import useTimer from "hooks/useTimer";
import { getIdFromEntity } from "utils/api";
import styled from "styled-components";
import { Section } from "./components";
import { getRepresentasjonspunktId } from "utils/map/source";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { numberValidation, stringValidation } from "utils/validation";
import Button from "components/form/Button";

type Inputs = {
  stemmekretsnavn: string;
  stemmekretsnummer: string;
  tellekretsnavn: string;
  tellekretsnummer: string;
};

/*
const fromFormToRequest = (
  data: Inputs,
  stemmekrets: StemmekretsResponse
): StemmekretsRequest => ({
  identifikasjon: {
    lokalid: getIdFromEntity(stemmekrets),
  },
  valgdistriktsnummer: stemmekrets.valgdistriktsnummer,
  version: stemmekrets.version,
  stemmekretsnavn: data.stemmekretsnavn,
  stemmekretsnummer: data.stemmekretsnummer,
  tellekretsnavn: data.tellekretsnavn,
  tellekretsnummer: data.tellekretsnummer,
});
*/

type Props = {
  stemmekretsId: string;
  kommuneId: string;
  utkastStemmekrets: StemmekretsResponse | undefined;
};

const DetailsTab = ({ stemmekretsId, kommuneId, utkastStemmekrets }: Props) => {
  const { t } = useTranslation();
  const { startTimer, clearTimer } = useTimer();
  const { register, setValue, getValues } = useForm<Inputs>();
  const { addEntry } = useToolbarSaving();
  const previousValues = useRef<Inputs>(getValues());

  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    if (!utkastStemmekrets) return;

    setValue("stemmekretsnavn", utkastStemmekrets.stemmekretsnavn);
    setValue("stemmekretsnummer", utkastStemmekrets.stemmekretsnummer);
    setValue("tellekretsnavn", utkastStemmekrets.tellekretsnavn ?? "");
    setValue("tellekretsnummer", utkastStemmekrets.tellekretsnummer ?? "");

    previousValues.current = getValues();
  }, [utkastStemmekrets, setValue, getValues]);

  const setFormValues = useCallback(
    (change: StemmekretsEntry["changes"][number], direction: "to" | "from") => {
      const newName = change[direction]?.stemmekretsnavn;
      const newNumber = change[direction]?.stemmekretsnummer;
      setValue("stemmekretsnavn", newName ?? "");
      setValue("stemmekretsnummer", newNumber ?? "");
      setValue("tellekretsnavn", change[direction]?.tellekretsnavn ?? "");
      setValue("tellekretsnummer", change[direction]?.tellekretsnummer ?? "");

      updateEditFeatureText(
        getRepresentasjonspunktId(stemmekretsId),
        newName,
        newNumber
      );
    },
    [setValue, stemmekretsId]
  );

  useKretsToolbarSync<StemmekretsEntry>({
    entityId: stemmekretsId,
    redoEventKey: "stemmekretsRedo",
    undoEventKey: "stemmekretsUndo",
    setFormValues,
  });

  const onChange = () => {
    clearTimer();

    if (!utkastStemmekrets) return;

    const newValues = getValues();
    previousValues.current = newValues;
    updateEditFeatureText(
      getRepresentasjonspunktId(stemmekretsId),
      newValues.stemmekretsnavn,
      newValues.stemmekretsnummer
    );
    setHasValidated(false);

    // TODO: dette bør ikke skje før etter man har trykket på lagring, og da kan man kanskje ikke undoe uansett så er kanskje ikke vits med history her?
    /*startTimer(() => {
      addEntry({
        type: "stemmekrets",
        kommuneId,
        changes: [
          {
            from: fromFormToRequest(previousValues.current, utkastStemmekrets),
            to: fromFormToRequest(newValues, utkastStemmekrets),
            id: stemmekretsId,
          },
        ],
      });
    }, 500);*/
  };

  // TODO: denne utløser nå validering, men den bør faktisk "få svar tilbake" om valideringen var tommel opp eller ned
  // slik at man kan vite om man skal gå videre med å lagre eller ikke
  // føler vi trenger en helt annen løsning her egentlig
  const onSubmit = () => {
    setHasValidated(true);
  };

  const formOptions = {
    onChange,
  };

  // Navn og nummer for tellekrets må alltid være i sync, hjelpefunksjon for å spare plass
  const isTellekretsInvalid = (valueToBeValidated: "nummer" | "navn") => {
    // TODO: denne fungerer ikke helt når jeg skal f.eks. sjekke om tellekretsnummer er et nummer
    if (valueToBeValidated === "nummer") {
      return (
        stringValidation.isEmpty(getValues().tellekretsnummer) &&
        !stringValidation.isEmpty(getValues().tellekretsnavn)
      );
    } else if (valueToBeValidated === "navn") {
      return (
        !stringValidation.isEmpty(getValues().tellekretsnummer) &&
        stringValidation.isEmpty(getValues().tellekretsnavn)
      );
    }
    return false;
  };

  return (
    <DetailsSection>
      <Input
        label={t("stemmekrets.Stemmekretsnummer")}
        {...register("stemmekretsnummer", { ...formOptions })}
        validationError={[
          {
            message: "Stemmekretsnummer kan ikke være tomt",
            showError:
              hasValidated &&
              stringValidation.isEmpty(getValues().stemmekretsnummer),
          },
          {
            message: "Stemmekretsnummer må kun inneholde siffer (maks 4)",
            showError:
              hasValidated &&
              (!stringValidation.isInteger(getValues().stemmekretsnummer) ||
                parseInt(getValues().stemmekretsnummer) > 9999),
          },
          {
            message: "Stemmekretsnummer kan ikke være 0 eller et negativt tall",
            showError:
              hasValidated &&
              !numberValidation.isPositive(
                parseInt(getValues().stemmekretsnummer)
              ),
          },
          {
            message: "Stemmekretsnummer må være unik for den bestemte kommunen",
            showError: hasValidated && false, // TODO: krever egen håndtering
          },
        ]}
      />
      <Input
        label={t("tabell.Stemmekretsnavn")}
        {...register("stemmekretsnavn", formOptions)}
        validationError={[
          {
            message: "Stemmekretsnavn kan ikke være tomt",
            showError:
              hasValidated &&
              stringValidation.isEmpty(getValues().stemmekretsnavn),
          },
        ]}
      />
      <Input
        label={t("stemmekrets.Tellekretsnummer")}
        {...register("tellekretsnummer", formOptions)}
        validationError={[
          {
            message:
              "Må ha både navn og nummer for tellekrets, eller ingen av delene",
            showError: hasValidated && isTellekretsInvalid("nummer"),
          },
          {
            message: "Tellekretsnummer må være et tall",
            showError:
              hasValidated &&
              isTellekretsInvalid("nummer") &&
              !stringValidation.isInteger(getValues().tellekretsnummer),
          },
          {
            message: "Tellekretsnummer kan ikke være 0 eller et negativt tall",
            showError:
              hasValidated &&
              isTellekretsInvalid("nummer") &&
              !numberValidation.isPositive(
                parseInt(getValues().tellekretsnummer)
              ),
          },
        ]}
      />
      <Input
        label={t("stemmekrets.Tellekretsnavn")}
        {...register("tellekretsnavn", formOptions)}
        validationError={[
          {
            message:
              "Må ha både navn og nummer for tellekrets, eller ingen av delene",
            showError: hasValidated && isTellekretsInvalid("navn"),
          },
        ]}
      />
      <Button onClick={onSubmit}>Lagre</Button>
    </DetailsSection>
  );
};

const DetailsSection = styled(Section)`
  display: grid;
  grid-template-columns: 185px 350px;
  gap: 30px 12px;
  color: var(--gray_dark);
`;

export default DetailsTab;
