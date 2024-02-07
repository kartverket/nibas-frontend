import { Button } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  isActivated: boolean;
  isReversed: boolean;
};

const SortHeader = ({ children, onClick, isActivated, isReversed }: Props) => {
  const getRightIcon = () => {
    if (!isActivated) {
      return undefined;
    }
    return isReversed ? "keyboard_arrow_up" : "keyboard_arrow_down";
  };

  return (
    <th>
      <ClickableHeader variant="ghost" isActive={isActivated} onClick={onClick} rightIcon={getRightIcon()}>
        {children}
      </ClickableHeader>
    </th>
  );
};

const ClickableHeader = styled(Button)`
  margin-left: -16px;
`;

export default SortHeader;
