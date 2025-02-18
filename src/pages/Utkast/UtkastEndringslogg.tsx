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
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { EndringerForFylke } from "components/Endringslogg/EndringerForFylke";
import { EndringerUtenTilhorighet } from "components/Endringslogg/EndringerUtenTilhorighet";

type Props = {
  utkast: UtkastResponse;
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

export const EndringsloggAccordion = ({ utkast }: Props) => {
  const { harEndringer, laster, stemmekretsendringer, grunnkretsendringer, kommunendringer, endringerutentilhorighet } =
    useUtkastEndringer(utkast);
  const harLastetData = !laster || !!stemmekretsendringer || !!grunnkretsendringer;

  return (
    <Accordion collapsible defaultIndex={[0]}>
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
              <EndringerForKommune
                key={endringer.kommune.id}
                kretstype={KontekstType.STEMMEKRETS}
                endringer={endringer}
              />
            ))}

            {grunnkretsendringer?.map((endringer) => (
              <EndringerForKommune
                key={endringer.kommune.id}
                kretstype={KontekstType.GRUNNKRETS}
                endringer={endringer}
              />
            ))}
            {kommunendringer?.map((endringer) => <EndringerForFylke key={endringer.nummer} endringer={endringer} />)}
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
