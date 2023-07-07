import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  useDisclosure,
} from "@kvib/react";
import { EndringsloggGrunnkretsendringer } from "components/Endringslogg/EndringsloggGrunnkretsendringer";
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
  const { harEndringer, laster, stemmekretsendringer, grunnkretsendringer } =
    useUtkastEndringer(utkast);

  const harLastetData =
    !laster || !!stemmekretsendringer || !!grunnkretsendringer;

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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Endringer i dette utkastet</ModalHeader>
          <ModalCloseButton aria-label="Lukk" />
          <ModalBody>
            {!harEndringer && (
              <div>Det er ingen endringer i dette utkastet</div>
            )}

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
          </ModalBody>
        </ModalContent>
      </Modal>
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
export const EndringsloggAccordionButton = styled(AccordionButton)`
  display: flex;
  justify-content: space-between;
  font-weight: var(--kvib-fontWeights-bold);
`;

export default UtkastEndringslogg;
