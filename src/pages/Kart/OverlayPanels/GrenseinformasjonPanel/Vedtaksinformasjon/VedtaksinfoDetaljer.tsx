import { Button, Modal, ModalBody, ModalContent, Text, ModalOverlay, useToast } from "@kvib/react";
import { Feature } from "ol";
import { VedtaksinfoBody } from "./VedtaksinfoBody";
import { FormViewState, Referanse, VedtakinfoForm } from "./Vedtaksinformasjon";
import { styled } from "styled-components";
import { mapFromFormToApi, useVedtaksinfoForm } from "../../hooks/useVedtaksinfoForm";
import { DokumentasjonsreferanseDTO, Metadata } from "types/api";
import { useState } from "react";
import { PanelHeader } from "../../Panel";
import { isTempDokrefId } from "./util/vedtaksinfoHelperMethods";

type DetaljerProps = {
  setFormViewState: React.Dispatch<React.SetStateAction<FormViewState>>;
  formViewState: FormViewState;
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
  vedtak?: DokumentasjonsreferanseDTO;
  isDisabled: boolean;
};

export const VedtaksinfoDetaljer = ({
  formViewState,
  setFormViewState,
  isOpen,
  onClose,
  feature,
  vedtak,
  isDisabled,
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
    getValues,
  } = useVedtaksinfoForm(feature, vedtak);

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
      const postValues = mapFromFormToApi(data, dokref, internref);
      toast({
        status: "success",
        title: `Vedtaksinformasjonen er ${postValues.id != null ? "oppdatert" : "lagt til"}`,
      });
      updateDraftFromFeature(postValues);
    }
  };

  const isFormValidOnSubmit = (data: VedtakinfoForm) => {
    if (data.vedtakGyldigTil && data.vedtakGyldigFra) {
      if (data.vedtakGyldigFra >= data.vedtakGyldigTil) {
        setError("vedtakGyldigTil", {
          message: "Gyldig til må være satt til en dato etter gyldig fra dato.",
        });
        return false;
      }

      if (new Date() >= data.vedtakGyldigTil) {
        setError("vedtakGyldigTil", {
          message: "Kan ikke sette gyldighetsdato til dagens dato eller tidligere.",
        });
        return false;
      }
    }

    return true;
  };

  const onSubmit = (data: VedtakinfoForm) => {
    if (!isFormValidOnSubmit(data)) {
      return;
    }

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

  if (!metadata) {
    return;
  }

  if (isOpen && vedtak != null) {
    if (dokref == null) {
      setDokref(vedtak.dokumentlenker);
    }
    if (internref == null) {
      setInternref(vedtak.internReferanserKartverket);
    }
  }

  const toggleEndreVedtak = () => {
    setFormViewState(formViewState === "editing" ? "viewing" : "editing");
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered size="6xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VedtakHeaderContainer>
            <PanelHeader onClose={closeModal}>
              <Text>{`Se ${!isDisabled ? "eller endre på" : ""} vedtaksinformasjon`}</Text>
            </PanelHeader>
          </VedtakHeaderContainer>
          <ModalBody>
            <VedtaksinfoBody
              formViewState={formViewState}
              clearErrors={clearErrors}
              control={control}
              errors={errors}
              setError={setError}
              register={register}
              dokref={dokref}
              internref={internref}
              setDokref={setDokref}
              setInternref={setInternref}
              deleteInternref={deleteInternref}
              deleteDokref={deleteDokref}
              values={getValues}
            />
          </ModalBody>

          {!isDisabled && (
            <VedtakFooterContainer>
              <VedtaksFooter
                onAvbryt={onAvbryt}
                toggleEndreVedtak={toggleEndreVedtak}
                formViewState={formViewState}
                onClose={closeModal}
                deleteOrArchive={async () => {
                  const didDeleteOrArchive = await deleteOrArchive();
                  if (didDeleteOrArchive) {
                    closeModal();
                  }
                }}
                vedtaksinfoIsPersisted={isVedtakPersisted(vedtak, metadata)}
              />
            </VedtakFooterContainer>
          )}
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
  if (formViewState === "viewing") {
    return <VisVedtakFooter toggleEndreVedtak={toggleEndreVedtak} />;
  } else if (formViewState === "editing") {
    return (
      <EndreVedtakFooter
        onAvbryt={onAvbryt}
        deleteOrArchive={deleteOrArchive}
        vedtaksinfoIsPersisted={vedtaksinfoIsPersisted}
      />
    );
  } else {
    return <NyttVedtakFooter onClose={onClose} />;
  }
};

const VisVedtakFooter = ({ toggleEndreVedtak }: { toggleEndreVedtak: () => void }) => {
  return (
    <VedtakFooterRight>
      <ButtonsContainer>
        <Button variant="secondary" onClick={() => toggleEndreVedtak()}>
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
        <Button variant="tertiary" onClick={onClose}>
          Avbryt
        </Button>
        <Button type="submit">Legg til vedtaksinformasjon</Button>
      </ButtonsContainer>
    </VedtakFooterRight>
  );
};

const EndreVedtakFooter = ({
  onAvbryt,
  deleteOrArchive,
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
              padding="6px"
              aria-label="Arkver referansen"
              onClick={deleteOrArchive}
            >
              <p>Arkiver referansen</p>
            </Button>
          ) : (
            <Button
              rightIcon="delete_forever"
              variant="tertiary"
              colorScheme="red"
              padding="6px"
              aria-label="Slett referansen"
              onClick={deleteOrArchive}
            >
              <p>Slett referansen</p>
            </Button>
          )}
        </ButtonsContainer>
      </VedtakFooterLeft>
      <VedtakFooterRight>
        <ButtonsContainer>
          <Button onClick={onAvbryt} variant="tertiary">
            Avbryt
          </Button>
          <Button type="submit">Bekreft</Button>
        </ButtonsContainer>
      </VedtakFooterRight>
    </>
  );
};

const VedtakHeaderContainer = styled.div`
  padding: 0 24px;
  margin-bottom: -20px;
`;

const VedtakFooterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0 24px;
  padding: 12px 0;
  border-top: 2px solid var(--kvib-colors-gray-50);
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

function isVedtakPersisted(vedtak: DokumentasjonsreferanseDTO | undefined, metadata: Metadata) {
  if (metadata.dokumentasjonsreferanser == null) {
    return false;
  }
  if (vedtak) {
    return !isTempDokrefId(vedtak.id);
  }

  return true;
}

const ButtonsContainer = styled.div`
  /* display: inline-block; */
`;
