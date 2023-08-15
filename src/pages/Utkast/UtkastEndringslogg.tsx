import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  MenuItem,
  Skeleton,
  useDisclosure,
} from "@kvib/react";
import { EndringsloggGrunnkretsendringer } from "components/Endringslogg/EndringsloggGrunnkretsendringer";
import EndringsloggModal from "components/Endringslogg/EndringsloggModal";
import { EndringsloggStemmekretsendringer } from "components/Endringslogg/EndringsloggStemmekretsendringer";
import { useUtkastEndringer } from "components/Endringslogg/hooks/useUtkastEndringer";
import Icon from "components/Icon";
import styled from "styled-components";
import { UtkastResponse } from "types/api";

type Props = {
  utkast: UtkastResponse;
};

const UtkastEndringslogg = ({ utkast }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <MenuItem
        icon={<Icon icon="published_with_changes" />}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        Se endringslogg
      </MenuItem>
      <EndringsloggModal isOpen={isOpen} onClose={onClose} utkast={utkast} />
    </>
  );
};

export const EndringsloggAccordion = ({ utkast }: Props) => {
  const { harEndringer, laster, stemmekretsendringer, grunnkretsendringer } =
    useUtkastEndringer(utkast);

  const harLastetData =
    !laster || !!stemmekretsendringer || !!grunnkretsendringer;

  return (
    <Accordion allowToggle defaultIndex={[0]}>
      <EndringsloggAccordionItem>
        <EndringsloggAccordionButton>
          Endringer i dette utkastet
          <AccordionIcon />
        </EndringsloggAccordionButton>
        <AccordionPanel>
          {!harEndringer && <div>Det er ingen endringer i dette utkastet</div>}

          {stemmekretsendringer?.map((endringer) => (
            <Skeleton key={endringer.kommune.id} isLoaded={harLastetData}>
              <EndringsloggStemmekretsendringer endringer={endringer} />
            </Skeleton>
          ))}

          {grunnkretsendringer?.map((endringer) => (
            <Skeleton key={endringer.kommune.id} isLoaded={harLastetData}>
              <EndringsloggGrunnkretsendringer endringer={endringer} />
            </Skeleton>
          ))}
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
