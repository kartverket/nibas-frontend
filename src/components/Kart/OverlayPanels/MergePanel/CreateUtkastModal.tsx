import { useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useHistory } from "contexts/HistoryContext";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import { createUtkast as createApiUtkast } from "api/utkast";
import Input from "components/Input";
import { statusCode } from "utils/api";
import { UtkastOperasjoner } from "../../../../types/api";
import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@kvib/react";

const Body = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export type CreateUtkastCallbackArgument = {
  id: string;
  navn: string;
  endringstype: string;
  operasjoner: UtkastOperasjoner;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  callback: (newUtkast: CreateUtkastCallbackArgument) => void;
};

// TODO: midlertidig løsning for å opprette utkast inntil history er ferdigimplementert
const CreateUtkastModal = ({ isOpen, onClose, callback }: Props) => {
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

    onClose();
    setSearchParams({ utkast: utkastId });

    callback({ ...nyttUtkast, id: utkastId });
  };

  const cancelCreateUtkast = () => {
    clearHistory({ hasPreviouslySavedHistory: false });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Opprett et nytt utkast</ModalHeader>
        <ModalCloseButton />
        <Body>
          <Input
            label="Navn på utkast"
            placeholder="f.eks. Endring av stemmekrets i Froland"
            value={utkastName}
            onChange={(e) => setUtkastName(e.target.value)}
          />
          <FormControl>
            <FormLabel>Endringstype</FormLabel>
            <Select
              placeholder="Velg en endringstype fra listen"
              value={utkastType}
              onChange={(e) => setUtkastType(e.target.value)}
            >
              {translateKeysByEndringsType.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormControl>
        </Body>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={() => cancelCreateUtkast()} variant="ghost">
              Avbryt
            </Button>
            <Button
              onClick={createUtkast}
              isDisabled={utkastType === "" || utkastName === ""}
              isLoading={oppretterUtkast}
            >
              Opprett
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateUtkastModal;
