import {
  Button,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Text,
  useToast,
} from "@kvib/react";
import { Feature } from "ol";
import { VedtaksinfoBody } from "./VedtaksinfoBody";
import { BorderBottom, BorderTop, Referanse, VedtakinfoForm } from "./OversiktReferanser";
import { styled } from "styled-components";
import { mapFromFormToApi, useVedtaksinfoForm } from "../../hooks/useVedtaksinfoForm";
import { Metadata } from "types/api";
import { useState } from "react";
import { id } from "date-fns/locale";

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
    errors,
    control,
    deleteOrArchive,
    setError,
    clearErrors,
  } = useVedtaksinfoForm(feature, selectedVedtaksinfoIndex);

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

  const updateFeature = (data: VedtakinfoForm) => {
    if (isDirty) {
      toast({
        status: "success",
        title: `Vedtaksinformasjonen er ${selectedVedtaksinfoIndex === undefined ? "lagt til" : "oppdatert"}`,
      });
      const postValues = mapFromFormToApi(data, dokref, internref);
      updateDraftFromFeature(postValues);
    }
  };

  const onSubmit = (data: VedtakinfoForm) => {
    updateFeature(data);
    if (redigeringsmodus) {
      toggleEndreVedtak();
      return;
    }
    closeModal();
  };

  const onAvbryt = () => {
    cleanForm();
    toggleEndreVedtak();
  };

  const closeModal = () => {
    cleanForm();
    onClose();
  };

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
              clearErrors={clearErrors}
              control={control}
              errors={errors}
              setError={setError}
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
            <VedtakFooterContainer>
              <VedtaksFooter
                onAvbryt={onAvbryt}
                toggleEndreVedtak={toggleEndreVedtak}
                redigeringsmodus={redigeringsmodus}
                displayMode={displayMode}
                onClose={closeModal}
                deleteOrArchive={() => {
                  deleteOrArchive();
                  closeModal();
                }}
                vedtaksinfoIsPersisted={isVedtakPersisted(selectedVedtaksinfoIndex, metadata)}
              />
            </VedtakFooterContainer>
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
  deleteOrArchive,
  vedtaksinfoIsPersisted,
  onAvbryt,
}: {
  onAvbryt: () => void;
  vedtaksinfoIsPersisted: boolean;
  redigeringsmodus: boolean;
  displayMode: boolean;
  onClose: () => void;
  toggleEndreVedtak: () => void;
  deleteOrArchive: () => void;
}) => {
  if (displayMode) return <VisVedtakFooter toggleEndreVedtak={toggleEndreVedtak} />;
  else if (redigeringsmodus)
    return (
      <EndreVedtakFooter
        onAvbryt={onAvbryt}
        onClose={onClose}
        deleteOrArchive={deleteOrArchive}
        vedtaksinfoIsPersisted={vedtaksinfoIsPersisted}
      />
    );
  else return <NyttVedtakFooter onClose={onClose} />;
};

const VisVedtakFooter = ({ toggleEndreVedtak }: { toggleEndreVedtak: () => void }) => {
  return (
    <VedtakFooterRight>
      <ButtonsContainer>
        <Button size="md" variant="secondary" onClick={() => toggleEndreVedtak()}>
          Endre vedtaksinformasjon
        </Button>
      </ButtonsContainer>
    </VedtakFooterRight>
  );
};

const NyttVedtakFooter = ({ onClose }: { onClose: () => void }) => {
  return (
    <VedtakFooterRight>
      <ButtonsContainer>
        <Button variant="tertiary" colorScheme="blue" size="md" onClick={onClose}>
          Avbryt
        </Button>
        <Button type="submit" size="md">
          Legg til vedtaksinformasjon
        </Button>
      </ButtonsContainer>
    </VedtakFooterRight>
  );
};

const EndreVedtakFooter = ({
  onClose,
  onAvbryt,
  deleteOrArchive: onArchive,
  vedtaksinfoIsPersisted,
}: {
  onAvbryt: () => void;
  onClose: () => void;
  deleteOrArchive: () => void;
  vedtaksinfoIsPersisted: boolean;
}) => {
  return (
    <>
      <VedtakFooterLeft>
        <ButtonsContainer>
          {vedtaksinfoIsPersisted ? (
            <Button
              rightIcon="archive"
              variant="tertiary"
              colorScheme="blue"
              aria-label="Arkver referansen"
              onClick={onArchive}
            >
              <p>Arkiver referansen</p>
            </Button>
          ) : (
            <Button
              rightIcon="delete_forever"
              variant="tertiary"
              colorScheme="red"
              aria-label="Slett referansen"
              onClick={onArchive}
            >
              <p>Slett referansen</p>
            </Button>
          )}
        </ButtonsContainer>
      </VedtakFooterLeft>
      <VedtakFooterRight>
        <ButtonsContainer>
          <Button colorScheme="blue" size="md" onClick={onAvbryt} variant="tertiary">
            Avbryt
          </Button>
          <Button type="submit" size="md">
            Bekreft
          </Button>
        </ButtonsContainer>
      </VedtakFooterRight>
    </>
  );
};

const VedtakFooterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 15px 12px 5px 12px;
`;

const VedtakFooterLeft = styled.div`
  grid-column: 1;
  display: flex;
  justify-content: start;
`;

const VedtakFooterRight = styled.div`
  grid-column: 2;
  display: flex;
  justify-content: end;
`;

function isVedtakPersisted(selectedVedtaksinfoIndex: number | undefined, metadata: Metadata) {
  if (selectedVedtaksinfoIndex === undefined) return false;
  else if (metadata.dokumentasjonsreferanser === undefined) return false;
  else if (metadata.dokumentasjonsreferanser.at(selectedVedtaksinfoIndex)?.id === undefined) return false;
  return true;
}

const ButtonsContainer = styled.div`
  display: inline-block;
`;
