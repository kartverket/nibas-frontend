import { css, styled } from "styled-components";
import { AccordionItem, AccordionItemIndicator, AccordionItemTrigger } from "@kvib/react";

export const KartlagAccordionItem = styled(AccordionItem)`
  width: 100%;
  background: var(--kvib-colors-chakra-body-bg);
  border: none;
  border-radius: 8px;
`;

export const KartlagControls = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 8px;

  ${(props) =>
    props.$isExpanded &&
    css`
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `};
`;

export const KartlagAccordionIcon = styled(AccordionItemIndicator)`
  width: 40px;
  height: 40px;
  padding: 8px;
`;

export const KartlagAccordionButton = styled(AccordionItemTrigger)<{ $isVisible: boolean }>`
  width: fit-content;
  padding: 0;
  border-radius: 6px;

  &:hover {
    background: var(--kvib-colors-blue-100);
  }
`;
