import { Button, Modal, ModalBody, ModalContent, Text, ModalOverlay, useToast, Divider } from "@kvib/react";
import { Feature } from "ol";
import { VedtaksinfoBody } from "./VedtaksinfoBody";
import { FormViewState, Referanse, VedtakinfoForm } from "./Vedtaksinformasjon";
import { styled } from "styled-components";
import { mapFromFormToApi, useVedtaksinfoForm } from "../../hooks/useVedtaksinfoForm";
import { Metadata } from "types/api";
import { useState } from "react";
import { PanelHeader } from "../../Panel";

type DetaljerProps = {
  setFormViewState: React.Dispatch<React.SetStateAction<FormViewState>>;
  formViewState: FormViewState;
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
  selectedVedtaksinfoIndex?: number;
};

export const VedtaksinfoDetaljer = ({
  formViewState,
  setFormViewState,
  isOpen,
  onClose,
  feature,
  selectedVedtaksinfoIndex,
}: DetaljerProps) => {
  const [dokref, setDokref] = useState<Referanse[] | undefined>(undefined);
  const [internref, setInternref] = useState<Referanse[] | undefined>(undefined);
  const metadata = feature.getProperties()?.metadata as Metadata | undefined;
  const toast = useToast();
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

  const isFormValidOnSubmit = (data: VedtakinfoForm) => {
    if (data.vedtakGyldigTil && data.vedtakGyldigFra && data.vedtakGyldigFra > data.vedtakGyldigTil) {
      setError("vedtakGyldigTil", {
        message: 'Vedtakets "gyldig fra"-dato kan ikke overskride vedtakets "gyldig til"-dato.',
      });
      return false;
    }

    return true;
  };

  const onSubmit = (data: VedtakinfoForm) => {
    if (!isFormValidOnSubmit(data)) return;

    updateFeature(data);
    if (formViewState === "editing") {
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

  if (!metadata) return;

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
    setFormViewState(formViewState === "editing" ? "viewing" : "editing");
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered size={"6xl"}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VedtakHeaderContainer>
            <PanelHeader onClose={closeModal}>
              <Text>Se eller endre på vedtaksinformasjon</Text>
            </PanelHeader>
          </VedtakHeaderContainer>
          <ModalBody minHeight={"500px"}>
            <VedtaksinfoBody
              formViewState={formViewState}
              clearErrors={clearErrors}
              control={control}
              errors={errors}
              setError={setError}
              feature={feature}
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

          <Divider />
          <VedtakFooterContainer>
            <VedtaksFooter
              onAvbryt={onAvbryt}
              toggleEndreVedtak={toggleEndreVedtak}
              formViewState={formViewState}
              onClose={closeModal}
              deleteOrArchive={() => {
                deleteOrArchive();
                closeModal();
              }}
              vedtaksinfoIsPersisted={isVedtakPersisted(selectedVedtaksinfoIndex, metadata)}
            />
          </VedtakFooterContainer>
        </form>
      </ModalContent>
    </Modal>
  );
};

type FooterProps = {
  formViewState: FormViewState;
  onAvbryt: () => void;
  vedtaksinfoIsPersisted: boolean;
  onClose: () => void;
  toggleEndreVedtak: () => void;
  deleteOrArchive: () => void;
};

const VedtaksFooter = ({
  formViewState,
  onClose,
  toggleEndreVedtak,
  deleteOrArchive,
  vedtaksinfoIsPersisted,
  onAvbryt,
}: FooterProps) => {
  if (formViewState === "viewing") return <VisVedtakFooter toggleEndreVedtak={toggleEndreVedtak} />;
  else if (formViewState === "editing")
    return (
      <EndreVedtakFooter
        onAvbryt={onAvbryt}
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
  onAvbryt,
  deleteOrArchive: onArchive,
  vedtaksinfoIsPersisted,
}: {
  onAvbryt: () => void;
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

const VedtakHeaderContainer = styled.div`
  margin-left: 28px;
`;

const VedtakFooterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 12px;
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
