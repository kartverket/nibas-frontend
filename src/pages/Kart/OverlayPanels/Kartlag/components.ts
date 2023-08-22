import { styled } from "styled-components";
import { AccordionItem, AccordionButton, AccordionIcon } from "@kvib/react";

export const KartlagAccordionItem = styled(AccordionItem)`
  background: var(--kvib-colors-chakra-body-bg);
  border: none;
`;

export const KartlagAccordionButton = styled(AccordionButton)`
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;

  &:hover {
    background: var(--kvib-colors-gray-50);
  }

  &[aria-expanded="true"] {
    font-weight: var(--kvib-fontWeights-bold);
  }
`;

export const KartlagAccordionIcon = styled(AccordionIcon)`
  width: 40px;
  height: 40px;
  padding: 8px;
`;
