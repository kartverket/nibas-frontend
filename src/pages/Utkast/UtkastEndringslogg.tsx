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
import { EndringList } from "components/Endringslogg/EndringerList";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";

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
  const { harEndringer, laster, stemmekretsendringer, grunnkretsendringer } = useUtkastEndringer(utkast);
  const harLastetData = !laster || !!stemmekretsendringer || !!grunnkretsendringer;

  return (
    <Accordion allowToggle defaultIndex={[0]}>
      <EndringsloggAccordionItem>
        <EndringsloggAccordionButton>
          Endringer i dette utkastet
          <AccordionIcon />
        </EndringsloggAccordionButton>
        <AccordionPanel>
          {!harEndringer && harLastetData && <div>Det er ingen endringer i dette utkastet</div>}

          {!harLastetData && <Spinner size="xl" />}
          <EndringList>
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
          </EndringList>
        </AccordionPanel>
      </EndringsloggAccordionItem>
    </Accordion>
  );
};

const EndringsloggAccordionItem = styled(AccordionItem)`
  border: none;
  box-shadow: var(--kvib-shadows-base);
  border-radius: 8px;
`;

const EndringsloggAccordionButton = styled(AccordionButton)`
  display: flex;
  justify-content: space-between;
  font-weight: var(--kvib-fontWeights-bold);
`;

export default UtkastEndringslogg;
