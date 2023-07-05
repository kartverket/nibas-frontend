import { Button } from "@kvib/react";
import Icon from "components/Icon/Icon";
import styled from "styled-components";

const ClickableHeader = styled(Button)<{ $isActivated: boolean }>`
  color: var(--kvib-colors-gray-600);
  white-space: nowrap;
  padding: 0 8px;
  margin-left: -8px;

  &:hover {
    color: var(--kvib-colors-blue-500);
    background: var(--kvib-colors-gray-50);
  }

  .material-symbols-outlined {
    border-radius: 4px;
    margin-left: 6px;
  }
`;

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  isActivated: boolean;
  isReversed: boolean;
};

const SortHeader = ({ children, onClick, isActivated, isReversed }: Props) => {
  const getRightIcon = () => {
    if (!isActivated) {
      return null;
    }
    return isReversed ? (
      <Icon icon="arrow_drop_up" />
    ) : (
      <Icon icon="arrow_drop_down" />
    );
  };

  return (
    <th>
      <ClickableHeader
        variant="ghost"
        $isActivated={isActivated}
        onClick={onClick}
        rightIcon={getRightIcon()}
      >
        {children}
      </ClickableHeader>
    </th>
  );
};

export default SortHeader;
