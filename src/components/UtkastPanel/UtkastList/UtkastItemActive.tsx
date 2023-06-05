import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { UtkastItemExpanded } from "./UtkastItem";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import {
  useToolbarActions,
  useHistory,
  UtkastEntry,
} from "contexts/HistoryContext";
import useToolbarFormSync from "contexts/HistoryContext/useToolbarFormSync";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import useNibasApi from "hooks/useNibasApi";
import { Translation } from "i18n";
import { UtkastResponse } from "types/api";
import useAlertModal from "hooks/useAlertModal";
import { useUtkast } from "contexts/UtkastContext";
import useTimer from "hooks/useTimer";
import AlertModal from "components/Status/AlertModal";

type Inputs = {
  navn: string;
  endringsType: string;
};

const fromFormToRequest = (
  form: Inputs,
  utkast: UtkastResponse
): UtkastRequestWithoutOperations => ({
  ...utkast,
  navn: form.navn,
  endringstype: form.endringsType,
  version: utkast.version,
});

type Props = {
  utkastId: string;
};

const UtkastItemActive = ({ utkastId }: Props) => {
  const { t } = useTranslation();
  const { register, setValue, getValues } = useForm<Inputs>();
  const { closeUtkast, updateUtkastWithHistory } = useUtkast();

  const { data: fullUtkast } = useNibasApi("/v1/utkast/{id}", {
    id: utkastId,
  });

  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } =
    useAlertModal(
      t("utkast.ulagrede-endringer"),
      t("utkast.ulagrede-endringer-utdypende")
    );

  const previousValues = useRef<Inputs>(getValues());
  const { startTimer, clearTimer } = useTimer();

  const { addHistoryEntry } = useHistory();
  const { canSave } = useToolbarActions();

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    updateUtkastWithHistory();
  };

  useEffect(() => {
    if (!fullUtkast) return;

    setValue("navn", fullUtkast.navn);
    setValue("endringsType", fullUtkast.endringstype);

    previousValues.current = getValues();
  }, [fullUtkast, setValue, getValues]);

  const setFormValues = useCallback(
    (change: UtkastEntry["changes"][number], direction: "to" | "from") => {
      setValue("navn", change[direction]?.navn ?? "");
      setValue("endringsType", change[direction]?.endringstype ?? "");
    },
    [setValue]
  );

  useToolbarFormSync<UtkastEntry>({
    entityId: utkastId,
    undoEventKey: "utkastUndo",
    redoEventKey: "utkastRedo",
    setFormValues,
  });

  const onChange = () => {
    clearTimer();

    if (!fullUtkast) return;

    startTimer(
      () =>
        addHistoryEntry({
          type: "utkast",
          changes: [
            {
              from: fromFormToRequest(previousValues.current, fullUtkast),
              to: fromFormToRequest(getValues(), fullUtkast),
              id: fullUtkast.id,
            },
          ],
        }),
      700
    );

    previousValues.current = getValues();
  };

  const registerOptions = {
    onChange,
  };

  return (
    <UtkastItemExpanded>
      <Input
        label={t("utkast.Navn på utkast")}
        {...register("navn", registerOptions)}
      />
      <Select
        label={t("utkast.Type utkast")}
        {...register("endringsType", registerOptions)}
      >
        {Object.keys(translateKeysByEndringsType).map((type) => (
          <option key={type} value={type}>
            {t(translateKeysByEndringsType[type] as Translation)}
          </option>
        ))}
      </Select>
      <EditingUtkastText>
        {t("utkast.Du er nå i redigeringsmodus av dette utkastet")}
      </EditingUtkastText>
      <Buttons>
        <CancelButton onClick={canSave ? openModal : closeUtkast}>
          {t("action.Avslutt redigering")}
        </CancelButton>
        <Button onClick={handleSave}>{t("action.Lagre")}</Button>
      </Buttons>
      <AlertModal
        status="warning"
        title={modalTitle}
        body={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: t("Forkast endringer"),
          onClick: closeUtkast,
        }}
        primaryAction={{
          text: t("Fortsett redigering"),
          onClick: closeModal,
        }}
      />
    </UtkastItemExpanded>
  );
};

const EditingUtkastText = styled.p`
  margin: 0;
  margin-bottom: 8px;
  margin-top: 16px;
  font-style: italic;
  font-size: 14px;
  text-align: center;
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const CancelButton = styled(Button).attrs(() => ({
  variant: "tertiary",
}))`
  background-color: transparent;
  color: var(--blue);
`;

export default UtkastItemActive;
