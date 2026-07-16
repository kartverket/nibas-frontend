import { Button, Text } from "@kvib/react";
import { styled } from "styled-components";

type SortableProps = {
  onClick: () => void;
  isActivated: boolean;
  isReversed: boolean;
};

type Props = {
  text: string;
} & Partial<SortableProps>;

const FlatedataTableHeader = ({ text, onClick, isActivated, isReversed }: Props) => {
  const rightIcon = !(isActivated ?? false) ? undefined : (isReversed ?? false) ? "expand_less" : "expand_more";

  return (
    <th>
      {onClick == null || isActivated == null || isReversed == null ? (
        <Header>{text}</Header>
      ) : (
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
      )}
    </th>
  );
};

const Header = styled(Text)`
  display: inline;
  margin-left: -8px;
  padding: 0 8px;
  height: 20px;
  font-weight: 600;
  font-size: var(--kvib-fontSizes-sm);
  white-space: nowrap;
`;

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

  ${(props) => props.$iconCompensation && "margin-right: 8px"};
`;

export default FlatedataTableHeader;
