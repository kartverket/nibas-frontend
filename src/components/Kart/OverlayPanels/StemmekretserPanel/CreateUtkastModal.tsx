import { useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { Translation } from "i18n";
import { useTranslation } from "react-i18next";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useToolbar } from "contexts/ToolbarContext";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import { createUtkast as createApiUtkast } from "api/utkast";
import Input from "components/form/Input";
import Label from "components/form/Label";
import Select from "components/form/Select";
import Button from "components/form/Button";
import Heading from "components/typography/Heading";
import Modal from "components/Modal";
import { CustomModalWrapper, ModalOverlay } from "components/Modal/Modal";

const Frame = styled(CustomModalWrapper)`
  display: flex;
  flex-direction: column;
  gap: 20px;

  width: fit-content;
  padding: 20px 12px;
  border: 2px solid var(--gray_light);
  background: white;
  border-radius: 10px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.15);
  width: 365px;
`;

const BlockLabel = styled(Label)`
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--gray_dark);
`;

const Buttons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
`;

type Props = {
  isCreateUtkastModalOpen: boolean;
  setIsCreateUtkastModalOpen: (isCreateUtkastModalOpen: boolean) => void;
  callback: () => void;
};

// TODO: midlertidig løsning for å opprette utkast inntil history er ferdigimplementert
const CreateUtkastModal = ({
  isCreateUtkastModalOpen,
  setIsCreateUtkastModalOpen,
  callback,
}: Props) => {
  const { t } = useTranslation();
  const [utkastName, setUtkastName] = useState("");
  const [utkastType, setUtkastType] = useState("");
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { history, clearHistory } = useToolbar();
  const setSearchParams = useSearchParams()[1];

  const createUtkast = async () => {
    const response = await createApiUtkast(
      {
        navn: utkastName,
        endringstype: utkastType,
        operasjoner: historyToUtkastOperations(history),
      },
      tokenHolderFunc()?.token
    );

    if (response.status < 200 && response.status > 299) {
      throw new Error(
        "Klarte ikke opprette utkast. Det ble returnert en feilkode ved opprettelse"
      );
    }

    const json = await response.json();
    const utkastId = json.id;

    setIsCreateUtkastModalOpen(false);
    setSearchParams({ utkast: utkastId });
    callback();
    setIsCreateUtkastModalOpen(false);
  };

  const cancelCreateUtkast = () => {
    clearHistory({ hasPreviouslySavedHistory: false });
    setIsCreateUtkastModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateUtkastModalOpen}
      onRequestClose={() => setIsCreateUtkastModalOpen(false)}
      className="_"
      overlayClassName="_"
      contentElement={(props, contentChildren) => (
        <Frame {...props}>{contentChildren}</Frame>
      )}
      overlayElement={(props, overlayChildren) => (
        <ModalOverlay {...props}>{overlayChildren}</ModalOverlay>
      )}
    >
      <Heading size="xs" tag="h3">
        {t("utkast.Opprett et nytt utkast")}
      </Heading>
      <BlockLabel>
        {t("utkast.Navn på utkast")}
        <Input
          placeholder={t("f.eks. Endring av stemmekrets i Froland")}
          value={utkastName}
          onChange={(e) => setUtkastName(e.target.value)}
        />
      </BlockLabel>
      <BlockLabel>
        {t("utkast.Endringstype")}
        <Select
          value={utkastType}
          onChange={(e) => setUtkastType(e.target.value)}
        >
          <option value="" disabled>
            {t("utkast.Velg en endringstype fra listen")}
          </option>
          {Object.keys(translateKeysByEndringsType).map((type) => (
            <option key={type} value={type}>
              {t(translateKeysByEndringsType[type] as Translation)}
            </option>
          ))}
        </Select>
      </BlockLabel>
      <Buttons>
        <Button onClick={() => cancelCreateUtkast()} variant="tertiary">
          {t("action.Avbryt")}
        </Button>
        <Button
          onClick={createUtkast}
          disabled={utkastType === "" || utkastName === ""}
        >
          {t("action.Opprett")}
        </Button>
      </Buttons>
    </Modal>
  );
};

export default CreateUtkastModal;
