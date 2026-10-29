import {
  Alert,
  AlertIcon,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useToast,
} from "@kvib/react";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { KontekstEgenskaper } from "types/api";
import { addFeaturesToSource } from "utils/map/source";
import { useMap } from "utils/map/useMap";
import { useKartlagUpload } from "../Kartlag/useKartlagUpload";
import {
  andreGrensetyperISosiFil,
  lagBopliktomraadegrenserFraSosi,
  lagNyGrenseEndringer,
} from "./importer-sosi-grenser";

export type NyttBopliktomraade = {
  id: string;
  nummer: string;
  navn: string;
  version: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  kommuneId: string;
  nyeBopliktomraader: NyttBopliktomraade[];
};

const ImporterSosiGrenserModal = ({ isOpen, onClose, kommuneId, nyeBopliktomraader }: Props) => {
  const toast = useToast();
  const { utkast } = useUtkast();
  const { addHistoryEntry } = useHistory();
  const { zoomToFeatures } = useMap();
  const { uploadKartlag, isLoading } = useKartlagUpload();
  const { data: maalemetoder } = useNibasApi("/v1/kodeliste/maalemetode-koder");

  const [omraadeId, setOmraadeId] = useState<string>("");
  const [maalemetodeId, setMaalemetodeId] = useState<string>("");
  const [fil, setFil] = useState<File | null>(null);

  const valgtOmraade = nyeBopliktomraader.find((omraade) => omraade.id === omraadeId) ?? nyeBopliktomraader[0];
  const kanImportere = valgtOmraade != null && maalemetodeId !== "" && fil != null && utkast != null;

  // Hurtigtastene lytter på document. Stopper dem under opplastingen, så f.eks. angre ikke fjerner bopliktområdet
  // grensene skal knyttes til før de legges inn.
  useEffect(() => {
    if (!isLoading) {
      return;
    }
    const stoppTaster = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("keydown", stoppTaster, true);
    return () => window.removeEventListener("keydown", stoppTaster, true);
  }, [isLoading]);

  const importer = async () => {
    if (!kanImportere) {
      return;
    }
    const opplastet = await uploadKartlag(fil);
    if (opplastet == null) {
      return;
    }
    const andreGrensetyper = andreGrensetyperISosiFil(opplastet);
    if (andreGrensetyper.length > 0) {
      toast({
        status: "error",
        title: "Fila kan ikke importeres",
        description: `Alle linjene må ha grensetypen Bopliktområdegrense. Fila har også ${andreGrensetyper.join(", ")}.`,
      });
      return;
    }

    // Uten id peker tilhørigheten på et bopliktområde som opprettes i utkastet, via kommune og nummer
    const tilhorighet: KontekstEgenskaper = {
      id: undefined,
      kommuneId: { lokalid: { value: kommuneId }, gyldighetsdato: utkast.gyldigFra },
      kretsNummer: valgtOmraade.nummer,
      type: "BOPLIKTOMRAADE",
      version: valgtOmraade.version,
    };
    const grenser = lagBopliktomraadegrenserFraSosi(opplastet, { tilhorighet, maalemetodeId });
    if (grenser.length === 0) {
      toast({ status: "warning", title: "Fant ingen linjer i fila" });
      return;
    }

    addFeaturesToSource("edit", grenser);
    addHistoryEntry({
      type: "nygrense",
      changes: lagNyGrenseEndringer(grenser),
    });
    zoomToFeatures(grenser);
    toast({
      status: "success",
      title: `${grenser.length} grenser lagt til ${valgtOmraade.nummer} ${valgtOmraade.navn}`,
      description: "Juster og fest grensene ved behov før du lagrer utkastet.",
    });
    onClose();
  };

  // Opplastingen kan ikke avbrytes, så modalen holdes åpen til den er ferdig. Ellers legges grensene til etter at
  // brukeren har lukket den.
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="xl"
      closeOnEsc={!isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Importer grenser fra SOSI-fil</ModalHeader>
        <ModalCloseButton isDisabled={isLoading} />
        <Body>
          <Alert>
            <AlertIcon />
            Alle linjer i fila blir nye bopliktområdegrenser for området du velger. Linjene må ha objekttypen
            Bopliktområdegrense.
          </Alert>
          <FormControl isRequired>
            <FormLabel>Bopliktområde</FormLabel>
            <Select value={valgtOmraade?.id ?? ""} onChange={(e) => setOmraadeId(e.target.value)}>
              {nyeBopliktomraader.map((omraade) => (
                <option key={omraade.id} value={omraade.id}>
                  {omraade.nummer} {omraade.navn}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Målemetode for grensene</FormLabel>
            <Select
              placeholder="Velg målemetode"
              value={maalemetodeId}
              onChange={(e) => setMaalemetodeId(e.target.value)}
            >
              {maalemetoder?.items.map((maalemetode) => (
                <option key={maalemetode.id} value={maalemetode.id}>
                  {maalemetode.kode} {maalemetode.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>SOSI-fil</FormLabel>
            <Input type="file" accept=".sos" onChange={(e) => setFil(e.target.files?.[0] ?? null)} />
          </FormControl>
        </Body>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="tertiary" onClick={onClose} isDisabled={isLoading}>
              Avbryt
            </Button>
            <Button colorScheme="blue" onClick={importer} isLoading={isLoading} isDisabled={!kanImportere}>
              Importer grenser
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Body = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default ImporterSosiGrenserModal;
