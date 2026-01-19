import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Icon,
  MenuItem,
  Spinner,
  useDisclosure,
} from "@kvib/react";
import EndringsloggModal from "components/Endringslogg/EndringsloggModal";
import { useUtkastEndringer } from "components/Endringslogg/hooks/useUtkastEndringer";
import { styled } from "styled-components";
import { UtkastResponse } from "types/api";
import { EndringerForKommune } from "components/Endringslogg/EndringerForKommune";
import { EndringerForFylke } from "components/Endringslogg/EndringerForFylke";
import { EndringerUtenTilhorighet } from "components/Endringslogg/EndringerUtenTilhorighet";
import { KretsType } from "components/Endringslogg/hooks/utkastEndringerTypes";

type Props = {
  utkast: UtkastResponse;
};
type EndringsloggAccordionProps = {
  utkast: UtkastResponse;
  isOpen: boolean;
};

const UtkastEndringslogg = ({ utkast }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <MenuItem icon={<Icon icon="published_with_changes" />} onClick={onOpen}>
        Se endringslogg
      </MenuItem>
      <EndringsloggModal isOpen={isOpen} onClose={onClose} utkast={utkast} />
    </>
  );
};

export const EndringsloggAccordion = ({ utkast, isOpen }: EndringsloggAccordionProps) => {
  const {
    harEndringer,
    laster,
    stemmekretsendringer,
    grunnkretsendringer,
    bopliktomraadeendringer,
    kommunendringer,
    endringerutentilhorighet,
  } = useUtkastEndringer(utkast, isOpen);
  const harLastetData = !laster || !!stemmekretsendringer || !!grunnkretsendringer;

  return (
    <Accordion allowToggle defaultIndex={[0]}>
      <AccordionItem>
        <EndringsloggAccordionButton>
          Endringer i dette utkastet
          <AccordionIcon />
        </EndringsloggAccordionButton>
        <AccordionPanel>
          {!harEndringer && harLastetData && <div>Det er ingen endringer i dette utkastet</div>}

          {!harLastetData && <Spinner size="xl" color="blue.500" thickness="2px" emptyColor="gray.200" />}
          <ListWithNoDot>
            {stemmekretsendringer?.map((endringer) => (
              <EndringerForKommune key={endringer.kommune.id} kretstype={KretsType.STEMMEKRETS} endringer={endringer} />
            ))}

            {grunnkretsendringer?.map((endringer) => (
              <EndringerForKommune key={endringer.kommune.id} kretstype={KretsType.GRUNNKRETS} endringer={endringer} />
            ))}
            {bopliktomraadeendringer?.map((endringer) => (
              <EndringerForKommune
                key={endringer.kommune.id}
                kretstype={KretsType.BOPLIKTOMRAADE}
                endringer={endringer}
              />
            ))}
            {kommunendringer?.map((endringer) => (
              <EndringerForFylke key={endringer.nummer} endringer={endringer} />
            ))}
            {endringerutentilhorighet && <EndringerUtenTilhorighet endringer={endringerutentilhorighet} />}
          </ListWithNoDot>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

const EndringsloggAccordionButton = styled(AccordionButton)`
  display: flex;
  justify-content: space-between;
  font-weight: var(--kvib-fontWeights-bold);
`;

const ListWithNoDot = styled.ul`
  list-style: none;
`;

export default UtkastEndringslogg;
