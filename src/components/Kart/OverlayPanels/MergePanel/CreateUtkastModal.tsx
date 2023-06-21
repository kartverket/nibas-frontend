import { useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useHistory } from "contexts/HistoryContext";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import { createUtkast as createApiUtkast } from "api/utkast";
import Input from "components/form/Input";
import Select from "components/form/Select";
import { Modal, ModalContent } from "components/Modal";
import { statusCode } from "utils/api";
import { UtkastOperasjoner } from "../../../../types/api";
import { Button, Heading } from "@kvib/react";

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
  const [oppretterUtkast, setOppretterUtkast] = useState(false);
  const [utkastName, setUtkastName] = useState("");
  const [utkastType, setUtkastType] = useState("");
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { history, clearHistory } = useHistory();
  const setSearchParams = useSearchParams()[1];

  const createUtkast = async () => {
    setOppretterUtkast(true);
    const nyttUtkast = {
      navn: utkastName,
      endringstype: utkastType,
      operasjoner: historyToUtkastOperations(history),
    };

    const response = await createApiUtkast(
      nyttUtkast,
      tokenHolderFunc()?.token
    );

    setOppretterUtkast(false);
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
      <Heading size="xs" as="h3">
        Opprett et nytt utkast
      </Heading>
      <Input
        label="Navn på utkast"
        placeholder="f.eks. Endring av stemmekrets i Froland"
        value={utkastName}
        onChange={(e) => setUtkastName(e.target.value)}
      />
      <Select
        label="Endringstype"
        value={utkastType}
        onChange={(e) => setUtkastType(e.target.value)}
      >
        <option value="" disabled>
          Velg en endringstype fra listen
        </option>
        {translateKeysByEndringsType.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>
      <Buttons>
        <Button onClick={() => cancelCreateUtkast()} variant="tertiary">
          Avbryt
        </Button>
        <Button
          colorScheme="blue"
          onClick={createUtkast}
          disabled={utkastType === "" || utkastName === ""}
          isLoading={oppretterUtkast}
        >
          Opprett
        </Button>
      </Buttons>
    </Modal>
  );
};

export default CreateUtkastModal;
