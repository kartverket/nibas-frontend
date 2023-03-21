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
import Select from "components/form/Select";
import Button from "components/form/Button";
import Heading from "components/typography/Heading";
import { Modal, ModalContent } from "components/Modal";
import { statusCode } from "utils/api";
import { UtkastOperasjoner } from "../../../../types/api";

const ModalElement = styled(ModalContent)`
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

const Buttons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
`;

export type CreateUtkastCallbackArgument = {
  id: string;
  navn: string;
  endringstype: string;
  operasjoner: UtkastOperasjoner;
};

type Props = {
  isCreateUtkastModalOpen: boolean;
  setIsCreateUtkastModalOpen: (isCreateUtkastModalOpen: boolean) => void;
  callback: (newUtkast: CreateUtkastCallbackArgument) => void;
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
    const nyttUtkast = {
      navn: utkastName,
      endringstype: utkastType,
      operasjoner: historyToUtkastOperations(history),
    };

    const response = await createApiUtkast(
      nyttUtkast,
      tokenHolderFunc()?.token
    );

    if (statusCode.isError(response.status)) {
      throw new Error(
        "Klarte ikke opprette utkast. Det ble returnert en feilkode ved opprettelse"
      );
    }

    const json = await response.json();
    const utkastId = json.id;

    setIsCreateUtkastModalOpen(false);
    setSearchParams({ utkast: utkastId });
    callback({ ...nyttUtkast, id: utkastId });
  };

  const cancelCreateUtkast = () => {
    clearHistory({ hasPreviouslySavedHistory: false });
    setIsCreateUtkastModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateUtkastModalOpen}
      onRequestClose={() => setIsCreateUtkastModalOpen(false)}
      modalElement={ModalElement}
    >
      <Heading size="xs" tag="h3">
        {t("utkast.Opprett et nytt utkast")}
      </Heading>
      <Input
        label={t("utkast.Navn på utkast")}
        placeholder={t("f.eks. Endring av stemmekrets i Froland")}
        value={utkastName}
        onChange={(e) => setUtkastName(e.target.value)}
      />
      <Select
        label={t("utkast.Endringstype")}
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
