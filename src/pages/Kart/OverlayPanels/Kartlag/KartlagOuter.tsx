import { styled } from "styled-components";
import { Accordion, AccordionPanel, Alert, AlertIcon, Checkbox, Spacer } from "@kvib/react";
import KartlagMiddle from "./KartlagMiddle";
import KartlagInner from "./KartlagInner";
import { KartlagAccordionItem, KartlagAccordionIcon, KartlagControls, KartlagAccordionButton } from "./components";
import KartlagOpacity from "./KartlagOpacity";
import { MappedLayer, useKartlag } from "contexts/KartlagContext/KartlagContext";

type Props = {
  indexPath: number[];
  mappedLayer: MappedLayer;
};

const KartlagOuter = ({ indexPath, mappedLayer }: Props) => {
  const { toggleKartlag } = useKartlag();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleKartlag(mappedLayer, indexPath);
  };

  return (
    <KartlagAccordion allowToggle>
      <KartlagAccordionItem>
        {({ isExpanded }) => (
          <>
            <KartlagOuterControls $isVisible={mappedLayer.isVisible} $isExpanded={isExpanded}>
              <Checkbox
                isChecked={mappedLayer.isVisible}
                onChange={handleToggle}
                disabled={mappedLayer.sublayers.length === 0}
              >
                {mappedLayer.title}
              </Checkbox>
              <Spacer />
              <KartlagOpacity layerId={mappedLayer.sourceId} isDisabled={mappedLayer.sublayers.length === 0} />
              <KartlagAccordionButton $isVisible={mappedLayer.isVisible}>
                <KartlagAccordionIcon />
              </KartlagAccordionButton>
            </KartlagOuterControls>
            <KartlagAccordionPanel $isVisible={mappedLayer.isVisible}>
              {mappedLayer.sublayers.length === 0 && (
                <NoSublayersAlert status="info">
                  <AlertIcon />
                  {`${mappedLayer.sourceId === "sosiFiler" ? "Du må laste opp en sosi-fil for å aktivere dette kartlaget" : "Dette kartlaget har ingen underlag"}`}
                </NoSublayersAlert>
              )}
              {mappedLayer.sublayers.map((sublayer, i) =>
                sublayer.sublayers.length > 0 ? (
                  <KartlagMiddle key={sublayer.id} indexPath={[...indexPath, i]} mappedLayer={sublayer} />
                ) : (
                  <KartlagInner key={sublayer.id} indexPath={[...indexPath, i]} mappedLayer={sublayer} />
                ),
              )}
            </KartlagAccordionPanel>
          </>
        )}
      </KartlagAccordionItem>
    </KartlagAccordion>
  );
};

const KartlagAccordion = styled(Accordion)`
  width: 100%;
`;

const KartlagOuterControls = styled(KartlagControls)<{ $isVisible: boolean }>`
  padding: 12px 16px;
  border: 1px solid ${(props) => (props.$isVisible ? "transparent" : "var(--kvib-colors-gray-200)")};
  background: ${(props) => (props.$isVisible ? "var(--kvib-colors-blue-50)" : "transparent")};
`;

const KartlagAccordionPanel = styled(AccordionPanel)<{ $isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: ${(props) => (props.$isVisible ? "var(--kvib-colors-blue-50)" : "var(--kvib-colors-gray-50)")};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

// Brukes kun for sosi-filer atm, men den vil også vises hvis noen har brukt komponenten for et lag uten sublag
const NoSublayersAlert = styled(Alert)`
  margin-top: 12px;
  border-radius: 8px;
`;

export default KartlagOuter;
