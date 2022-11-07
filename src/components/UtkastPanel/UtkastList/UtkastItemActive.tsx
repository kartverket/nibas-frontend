import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ButtonsAndGyldigFra, UtkastItemExpanded } from "./UtkastItem";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import { BlockLabel } from "components/Kart/OverlayPanels/metadataComponents";
import { useToolbarSaving, UtkastEntry } from "contexts/ToolbarContext";
import useToolbarFormSync from "contexts/ToolbarContext/useToolbarFormSync";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import useNibasApi from "hooks/useNibasApi";
import { Translation } from "i18n";
import { UtkastResponse } from "types/api";
import Feedback from "components/Feedback/Feedback";
import useFeedback from "hooks/useFeedback";
import { useUtkast } from "contexts/UtkastContext";

type Inputs = {
  navn: string;
  gyldigFra: string;
  endringsType: string;
};

const fromFormToRequest = (
  form: Inputs,
  utkast: UtkastResponse
): UtkastRequestWithoutOperations => ({
  ...utkast,
  navn: form.navn,
  gyldigFra: form.gyldigFra,
  endringstype: form.endringsType,
  version: utkast.version,
});

type Props = {
  utkastId: string;
};

const UtkastItemActive = ({ utkastId }: Props) => {
  const { t } = useTranslation();
  const { register, setValue, getValues } = useForm<Inputs>();
  const { closeUtkast } = useUtkast();
  const { data: fullUtkast } = useNibasApi("/v1/utkast/{id}", {
    id: utkastId,
  });
  const { openFeedback, isOpen, closeFeedback, feedbackContent } = useFeedback(
    t(
      "Utkastet er ikke publisert enda. Vil du fullføre det senere, eller publisere med en gang?"
    )
  );

  const previousValues = useRef<Inputs>(getValues());

  const { addEntry } = useToolbarSaving();

  useEffect(() => {
    if (!fullUtkast) return;

    setValue("navn", fullUtkast.navn);
    setValue("endringsType", fullUtkast.endringstype);
    setValue("gyldigFra", fullUtkast.gyldigFra);

    previousValues.current = getValues();
  }, [fullUtkast, setValue, getValues]);

  const setFormValues = useCallback(
    (change: UtkastEntry["changes"][number], direction: "to" | "from") => {
      setValue("navn", change[direction]?.navn ?? "");
      setValue("endringsType", change[direction]?.endringstype ?? "");
      setValue("gyldigFra", change[direction]?.gyldigFra ?? "");
    },
    [setValue]
  );

  useToolbarFormSync<UtkastEntry>({
    entityId: utkastId,
    undoEventKey: "utkastUndo",
    redoEventKey: "utkastRedo",
    setFormValues,
  });

  const addUtkastEntry = () => {
    if (!fullUtkast) return;

    addEntry({
      type: "utkast",
      changes: [
        {
          from: fromFormToRequest(previousValues.current, fullUtkast),
          to: fromFormToRequest(getValues(), fullUtkast),
          id: fullUtkast.id,
        },
      ],
    });

    previousValues.current = getValues();
  };

  const registerOptions = {
    onBlur: addUtkastEntry,
  };

  return (
    <UtkastItemExpanded>
      <BlockLabel>
        {t("utkast.Navn på utkast")}
        <Input {...register("navn", registerOptions)} />
      </BlockLabel>
      <BlockLabel>
        {t("utkast.Type utkast")}
        <Select {...register("endringsType", registerOptions)}>
          {Object.keys(translateKeysByEndringsType).map((type) => (
            <option key={type} value={type}>
              {t(translateKeysByEndringsType[type] as Translation)}
            </option>
          ))}
        </Select>
      </BlockLabel>
      <ButtonsAndGyldigFra>
        <BlockLabel>
          {t("metadata.Gyldig fra")}
          <Input
            {...register("gyldigFra", registerOptions)}
            role="textbox"
            type="date"
          />
        </BlockLabel>
      </ButtonsAndGyldigFra>
      <Center>
        <EditingUtkastText>
          {t("utkast.Du er nå i redigeringsmodus av dette utkastet")}
        </EditingUtkastText>
        <CancelButton onClick={openFeedback}>
          {t("action.Avslutt redigering")}
        </CancelButton>
      </Center>
      <Feedback
        type="warning"
        title="Advarsel"
        isOpen={isOpen}
        onClose={closeFeedback}
        onContinue={closeUtkast}
      >
        {feedbackContent}
      </Feedback>
    </UtkastItemExpanded>
  );
};

const EditingUtkastText = styled.p`
  margin: 0;
  margin-bottom: 8px;
  margin-top: 16px;
  font-style: italic;
  font-size: 14px;
`;

const Center = styled.div`
  text-align: center;
`;

const CancelButton = styled(Button).attrs(() => ({
  variant: "teriary",
}))`
  background-color: ${({ theme }) => theme.colors.grayLight};
  border: none;
  color: ${({ theme }) => theme.colors.blue};
`;

export default UtkastItemActive;
