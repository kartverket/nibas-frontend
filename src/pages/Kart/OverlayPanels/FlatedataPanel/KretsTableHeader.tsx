import { Button } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  isActivated: boolean;
  isReversed: boolean;
};

const KretsTableHeader = ({ children, onClick, isActivated, isReversed }: Props) => {
  const getRightIcon = () => {
    if (!isActivated) {
      return undefined;
    }
    return isReversed ? "arrow_upward" : "arrow_downward";
  };

  return (
    <th>
      <ClickableHeader
        variant="ghost"
        colorScheme="gray"
        size="sm"
        isActive={isActivated}
        onClick={onClick}
        rightIcon={getRightIcon()}
      >
        {children}
      </ClickableHeader>
    </th>
  );
};

const ClickableHeader = styled(Button)`
  margin-left: -8px;
  padding: 0 8px;
  height: 20px;

  &[data-active] {
    font-weight: var(--kvib-fontWeights-bold);
    background: none;
  }

  &:hover {
    background: var(--kvib-colors-gray-50);
  }
`;

export default KretsTableHeader;
