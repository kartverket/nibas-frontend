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
import { useState } from "react";

export const VedtaksinfoDetaljer = ({
  isOpen,
  onClose,
  feature,
  displayMode,
  setDisplayMode,
  selectedVedtaksinfoIndex,
}: {
  displayMode: boolean;
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
  setDisplayMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedVedtaksinfoIndex?: number;
}) => {
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
  const [redigeringsmodus, setRedigeringsmodus] = useState(false);

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
              <VedtaksFooter
                redigeringsmodus={redigeringsmodus}
                setRedigeringsmodus={setRedigeringsmodus}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                onClose={onClose}
              />
            </ControlsContainer>
          </BorderTop>
        </form>
      </ModalContent>
    </Modal>
  );
};

const VedtaksFooter = ({
  redigeringsmodus,
  setRedigeringsmodus,
  displayMode,
  onClose,
  setDisplayMode,
}: {
  redigeringsmodus: boolean;
  setRedigeringsmodus: React.Dispatch<React.SetStateAction<boolean>>;
  setDisplayMode: React.Dispatch<React.SetStateAction<boolean>>;
  displayMode: boolean;
  onClose: () => void;
}) => {
  if (displayMode)
    return (
      <VisVedtakFooter
        setRedigeringsmodus={setRedigeringsmodus}
        setDisplayMode={setDisplayMode}
      />
    );
  else if (redigeringsmodus)
    return <EndreVedtakFooter onClose={onClose} onArchive={() => {}} />;
  else return <NyttVedtakFooter onClose={onClose} />;
};

const VisVedtakFooter = ({
  setRedigeringsmodus,
  setDisplayMode,
}: {
  setRedigeringsmodus: React.Dispatch<React.SetStateAction<boolean>>;
  setDisplayMode: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <ButtonsContainer>
      <Button
        mr={3}
        onClick={() => {
          setRedigeringsmodus(true);
          setDisplayMode(false);
        }}
      >
        Endre vedtaksinformasjon
      </Button>
    </ButtonsContainer>
  );
};

const NyttVedtakFooter = ({ onClose }: { onClose: () => void }) => {
  return (
    <ButtonsContainer>
      <Button colorScheme="blue" mr={3} onClick={onClose}>
        Avbryt
      </Button>
      <Button type="submit">Legg til vedtaksinformasjon</Button>
    </ButtonsContainer>
  );
};
const EndreVedtakFooter = ({
  onClose,
  onArchive,
}: {
  onClose: () => void;
  onArchive: () => void;
}) => {
  return (
    <>
      <ButtonsContainer>
        <Text>Arkiver</Text>
      </ButtonsContainer>
      <ButtonsContainer>
        <Button colorScheme="blue" mr={3} onClick={onClose}>
          Avbryt
        </Button>
        <Button type="submit">Bekreft</Button>
      </ButtonsContainer>
    </>
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
