import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Text,
} from "@kvib/react";
import { Feature } from "ol";
import { ReferanseBody } from "./ReferanseBody";
import { BorderBottom, BorderTop, VedtakinfoForm } from "./OversiktReferanser";
import { styled } from "styled-components";
import {
  mapFromFormToApi,
  useDokumentreferanser,
} from "./useDokumentreferanser";
import { Dokref, Metadata } from "types/api";

export const VedtaksinfoDetaljer = ({
  isOpen,
  onClose,
  feature,
  displayMode,
  selectedVedtaksinfoIndex,
}: {
  displayMode: boolean;
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
  selectedVedtaksinfoIndex?: number;
}) => {
  const erRedigeringsModus = true; //!displayMode && vedtaksinfoId;
  const {
    isDirty,
    register,
    reset,
    handleSubmit,
    dokref,
    setDokref,
    internref,
    setInternref,
    updateDraftFromFeature,
  } = useDokumentreferanser(feature, selectedVedtaksinfoIndex);

  const onSubmit = (data: VedtakinfoForm) => {
    if (isDirty) {
      const postValues = mapFromFormToApi(data, dokref, internref);
      updateDraftFromFeature(postValues);
      reset();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"5xl"}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <BorderBottom>
            <ModalHeader>Model header</ModalHeader>
          </BorderBottom>
          <ModalCloseButton />
          <ModalBody>
            <ReferanseBody
              feature={feature}
              displayMode={displayMode}
              register={register}
              dokref={dokref}
              internref={internref}
              setDokref={setDokref}
              setInternref={setInternref}
            />
          </ModalBody>

          <BorderTop>
            <ControlsContainer>
              <ButtonsContainer>
                {erRedigeringsModus && <Text>Arkiver</Text>}
              </ButtonsContainer>
              <ButtonsContainer>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Avbryt
                </Button>
                <Button type="submit">Bekreft</Button>
              </ButtonsContainer>
            </ControlsContainer>
          </BorderTop>
        </form>
      </ModalContent>
    </Modal>
  );
};

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  margin: 20px;
  padding-left: 10px;
`;

const ButtonsContainer = styled.div`
  display: inline-block;
`;
