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
import {
  BorderBottom,
  BorderTop,
  Referanse,
  VedtakinfoForm,
} from "./OversiktReferanser";
import { styled } from "styled-components";
import {
  mapFromFormToApi,
  useDokumentreferanser,
} from "./useDokumentreferanser";
import { Dokref, Metadata } from "types/api";
import { useEffect, useState } from "react";

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
  const metadata = feature.getProperties().metadata as Metadata;
  const [redigeringsmodus, setRedigeringsmodus] = useState(false);
  const [dokref, setDokref] = useState<Referanse[] | undefined>([]);
  const [internref, setInternref] = useState<Referanse[] | undefined>([]);

  const {
    isDirty,
    register,
    reset,
    handleSubmit,
    updateDraftFromFeature,
    watch,
    setValue,
  } = useDokumentreferanser(feature, selectedVedtaksinfoIndex);

  const cleanForm = () => {
    reset();
    setDokref(undefined);
    setInternref(undefined);
  };

  const onSubmit = (data: VedtakinfoForm) => {
    if (isDirty) {
      const postValues = mapFromFormToApi(data, dokref, internref);
      updateDraftFromFeature(postValues);
    }
    cleanForm();
    onClose();
  };

  const closeModal = () => {
    cleanForm();
    onClose();
  };

  // TODO: Er det noen måte å gjøre dette penere på uten at man får en ininite loop med re-rendring?
  if (isOpen) {
    if (dokref === undefined && selectedVedtaksinfoIndex !== undefined) {
      setDokref(
        metadata?.dokumentasjonsreferanser?.at(selectedVedtaksinfoIndex)
          ?.dokumentlenker || [],
      );
    }
    if (internref === undefined && selectedVedtaksinfoIndex !== undefined) {
      setInternref(
        metadata?.dokumentasjonsreferanser?.at(selectedVedtaksinfoIndex)
          ?.internReferanserKartverket || [],
      );
    }
  }

  const toggleEndreVedtak = () => {
    setDisplayMode(!displayMode);
    setRedigeringsmodus(!redigeringsmodus);
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered size={"5xl"}>
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
              vedtaksinfoIndex={selectedVedtaksinfoIndex}
              watch={watch}
              setValue={setValue}
            />
          </ModalBody>

          <BorderTop>
            <ControlsContainer>
              <VedtaksFooter
                toggleEndreVedtak={toggleEndreVedtak}
                redigeringsmodus={redigeringsmodus}
                displayMode={displayMode}
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
  displayMode,
  onClose,
  toggleEndreVedtak,
}: {
  redigeringsmodus: boolean;
  displayMode: boolean;
  onClose: () => void;
  toggleEndreVedtak: () => void;
}) => {
  if (displayMode)
    return <VisVedtakFooter toggleEndreVedtak={toggleEndreVedtak} />;
  else if (redigeringsmodus)
    return (
      <EndreVedtakFooter
        onClose={onClose}
        onArchive={() => {
          console.log("archived");
        }}
      />
    );
  else return <NyttVedtakFooter onClose={onClose} />;
};

const VisVedtakFooter = ({
  toggleEndreVedtak,
}: {
  toggleEndreVedtak: () => void;
}) => {
  return (
    <ButtonsContainer>
      <Button mr={3} onClick={() => toggleEndreVedtak()}>
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
        <Text onClick={onArchive}>Arkiver</Text>
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
