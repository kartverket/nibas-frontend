import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@kvib/react";
import { Feature } from "ol";
import { ReferanseBody } from "./ReferanseBody";
import { styled } from "styled-components";
import { BorderBottom, BorderTop } from "./OversiktReferanser";

export const ReferanserDetaljer = ({
  isOpen,
  onClose,
  feature,
  displayMode,
}: {
  displayMode: boolean;
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"5xl"}>
      <ModalContent>
        <BorderBottom>
          <ModalHeader>Model header</ModalHeader>
        </BorderBottom>
        <ModalCloseButton />
        <ModalBody>
          <ReferanseBody feature={feature} />
        </ModalBody>

        <BorderTop>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Avbryt
            </Button>
            <Button>Bekreft</Button>
          </ModalFooter>
        </BorderTop>
      </ModalContent>
    </Modal>
  );
};
