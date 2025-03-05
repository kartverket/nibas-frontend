import { Button } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
  text: string;
  onClick: () => void;
  isActivated: boolean;
  isReversed: boolean;
};

const FlatedataTableHeader = ({ text, onClick, isActivated, isReversed }: Props) => {
  const rightIcon = !isActivated ? undefined : isReversed ? "expand_less" : "expand_more";

  return (
    <th>
      <ClickableHeader
        variant="tertiary"
        colorScheme="blue"
        size="sm"
        isActive={isActivated}
        onClick={onClick}
        rightIcon={rightIcon}
        $iconCompensation={rightIcon === undefined}
        title={text}
        aria-label={"Sorter etter " + text}
      >
        {text}
      </ClickableHeader>
    </th>
  );
};

const ClickableHeader = styled(Button)<{ $iconCompensation: boolean }>`
  display: inline;
  margin-left: -8px;
  padding: 0 8px;
  height: 20px;

  /* Reserverer plass for fet tekst og ikon slik at kolonner ikke utvides */
  &::after {
    display: block;
    content: attr(title);
    font-weight: var(--kvib-fontWeights-bold);
    height: 0;
    color: transparent;
    overflow: hidden;
    visibility: hidden;
  }

  &[data-active] {
    font-weight: var(--kvib-fontWeights-bold);
    background: none;
  }

  ${(props) => props.$iconCompensation && "margin-right: 24px"};
`;

export default FlatedataTableHeader;
