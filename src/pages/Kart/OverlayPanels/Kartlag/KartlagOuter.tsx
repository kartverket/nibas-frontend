import { styled } from "styled-components";
import { Accordion, AccordionPanel } from "@kvib/react";
import { MappedLayer } from "utils/getLayersFromWMS";
import KartlagMiddle from "./KartlagMiddle";
import KartlagInner from "./KartlagInner";
import { KartlagAccordionItem, KartlagAccordionButton, KartlagAccordionIcon } from "./components";

type Props = {
    mappedLayer: MappedLayer;
};

const KartlagOuter = ({ mappedLayer }: Props) => {
    return (
        <Accordion allowToggle>
            <KartlagAccordionItem>
                <KartlagOuterAccordionButton>
                    <span>{mappedLayer.title}</span>
                    <KartlagAccordionIcon />
                </KartlagOuterAccordionButton>
                <KartlagAccordionPanel>
                    {mappedLayer.layers.map((subLayer) =>
                        subLayer.layers.length > 0 ? (
                            <KartlagMiddle key={subLayer.id} mappedLayer={subLayer} />
                        ) : (
                            <KartlagInner key={subLayer.id} mappedLayer={subLayer} />
                        ),
                    )}
                </KartlagAccordionPanel>
            </KartlagAccordionItem>
        </Accordion>
    );
};

const KartlagOuterAccordionButton = styled(KartlagAccordionButton)`
    &[aria-expanded="true"] {
        background: var(--kvib-colors-gray-50);
    }
`;

const KartlagAccordionPanel = styled(AccordionPanel)`
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--kvib-colors-gray-50);
`;

export default KartlagOuter;
