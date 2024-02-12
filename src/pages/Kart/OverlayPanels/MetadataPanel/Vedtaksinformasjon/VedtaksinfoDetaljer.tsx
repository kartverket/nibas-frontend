import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, Text, useToast } from "@kvib/react";
import { Feature } from "ol";
import { VedtaksinfoBody } from "./VedtaksinfoBody";
import { BorderBottom, BorderTop, Referanse, VedtakinfoForm } from "./OversiktReferanser";
import { styled } from "styled-components";
import { mapFromFormToApi, useVedtaksinfoForm } from "./useVedtaksinfoForm";
import { Metadata } from "types/api";
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
  const metadata = feature.getProperties().metadata as Metadata;
  const [redigeringsmodus, setRedigeringsmodus] = useState(false);
  const [dokref, setDokref] = useState<Referanse[] | undefined>([]);
  const [internref, setInternref] = useState<Referanse[] | undefined>([]);

  const { isDirty, register, reset, handleSubmit, updateDraftFromFeature, errors, control } = useVedtaksinfoForm(
    feature,
    selectedVedtaksinfoIndex,
  );

  const deleteDokref = (index: number) => {
    const dokrefCopy = structuredClone(dokref);
    dokrefCopy?.splice(index, 1);
    setDokref(dokrefCopy);
  };

  const deleteInternref = (index: number) => {
    const internrefCopy = structuredClone(internref);
    internrefCopy?.splice(index, 1);
    setInternref(internrefCopy);
  };
  const cleanForm = () => {
    reset(undefined, { keepDefaultValues: true });
    setDokref(undefined);
    setInternref(undefined);
  };
  const toast = useToast();

  const onSubmit = (data: VedtakinfoForm) => {
    if (isDirty) {
      toast({
        status: "success",
        title: `Vedtaksinformasjonen er ${selectedVedtaksinfoIndex === undefined ? "lagt til" : "oppdatert"}`,
      });
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
  if (isOpen && selectedVedtaksinfoIndex !== undefined) {
    const vedtaksinformasjon = metadata?.dokumentasjonsreferanser?.at(selectedVedtaksinfoIndex);
    if (dokref === undefined) {
      setDokref(vedtaksinformasjon?.dokumentlenker || []);
    }
    if (internref === undefined) {
      setInternref(vedtaksinformasjon?.internReferanserKartverket || []);
    }
  }

  const toggleEndreVedtak = () => {
    setDisplayMode(!displayMode);
    setRedigeringsmodus(!redigeringsmodus);
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered size={"6xl"}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <BorderBottom>
            <ModalHeader>Se eller endre på vedtaksinformasjon</ModalHeader>
          </BorderBottom>
          <ModalCloseButton />
          <ModalBody minHeight={"500px"}>
            <VedtaksinfoBody
              control={control}
              errors={errors}
              feature={feature}
              displayMode={displayMode}
              register={register}
              dokref={dokref}
              internref={internref}
              setDokref={setDokref}
              setInternref={setInternref}
              deleteInternref={deleteInternref}
              deleteDokref={deleteDokref}
              vedtaksinfoIndex={selectedVedtaksinfoIndex}
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
  if (displayMode) return <VisVedtakFooter toggleEndreVedtak={toggleEndreVedtak} />;
  else if (redigeringsmodus)
    return (
      <EndreVedtakFooter
        onClose={onClose}
        onArchive={() => {
          // TODO: Endepunkt må opprettes
        }}
      />
    );
  else return <NyttVedtakFooter onClose={onClose} />;
};

const VisVedtakFooter = ({ toggleEndreVedtak }: { toggleEndreVedtak: () => void }) => {
  return (
    <>
      <ButtonsContainer />
      <ButtonsContainer>
        <Button size="md" onClick={() => toggleEndreVedtak()}>
          Endre vedtaksinformasjon
        </Button>
      </ButtonsContainer>
    </>
  );
};

const NyttVedtakFooter = ({ onClose }: { onClose: () => void }) => {
  return (
    <>
      <ButtonsContainer />
      <ButtonsContainer>
        <Button variant="tertiary" colorScheme="blue" size="md" onClick={onClose}>
          Avbryt
        </Button>
        <Button type="submit" size="md">
          Legg til vedtaksinformasjon
        </Button>
      </ButtonsContainer>
    </>
  );
};

const EndreVedtakFooter = ({ onClose, onArchive }: { onClose: () => void; onArchive: () => void }) => {
  return (
    <>
      <ButtonsContainer>
        <Text onClick={onArchive}>Arkiver</Text>
      </ButtonsContainer>
      <ButtonsContainer>
        <Button colorScheme="blue" size="md" onClick={onClose} variant="tertiary">
          Avbryt
        </Button>
        <Button type="submit" size="md">
          Bekreft
        </Button>
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
