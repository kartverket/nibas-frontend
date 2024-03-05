import { styled } from "styled-components";
import { AccordionItem, AccordionButton, AccordionIcon } from "@kvib/react";

export const KartlagAccordionItem = styled(AccordionItem)`
  width: 100%;
  background: var(--kvib-colors-chakra-body-bg);
  border: none;
  border-radius: 8px;
`;

export const KartlagAccordionButton = styled(AccordionButton)`
  display: flex;
  padding: 8px 16px;
  border-radius: 8px;

  &:hover {
    background: var(--kvib-colors-gray-50);
  }

  &[aria-expanded="true"] {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

export const KartlagAccordionIcon = styled(AccordionIcon)`
  width: 40px;
  height: 40px;
  padding: 8px;
`;
