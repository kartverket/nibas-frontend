import { Button } from "@kvib/react";
import Icon from "components/Icon/Icon";
import styled from "styled-components";

const ClickableHeader = styled(Button)<{ $isActivated: boolean }>`
  color: ${(props) =>
    props.$isActivated ? "var(--blue)" : "var(--gray_dark)"};
  white-space: nowrap;
  padding: 0;

  &:hover {
    color: ${(props) => (props.$isActivated ? "var(--blue)" : "var(--black)")};
    background: transparent;

    .material-symbols-outlined {
      background: ${(props) =>
        props.$isActivated ? "var(--blue_light)" : "var(--gray_light)"};
    }
  }

  &:active {
    .material-symbols-outlined {
      background: var(--blue_light);
    }
  }

  .material-symbols-outlined {
    border-radius: 4px;
    margin-left: 6px;
    background: ${(props) => props.$isActivated && "var(--blue_light)"};
  }
`;

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  isActivated: boolean;
  isReversed: boolean;
};

const SortHeader = ({ children, onClick, isActivated, isReversed }: Props) => {
  return (
    <th>
      <ClickableHeader
        variant="ghost"
        $isActivated={isActivated}
        onClick={onClick}
        rightIcon={
          isReversed ? (
            <Icon icon="arrow_drop_up" />
          ) : (
            <Icon icon="arrow_drop_down" />
          )
        }
      >
        {children}
      </ClickableHeader>
    </th>
  );
};

export default SortHeader;
