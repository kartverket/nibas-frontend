import { IconButton, MaterialSymbol } from "@kvib/react";
import { styled } from "styled-components";

type HeaderButtonProps = {
  icon: MaterialSymbol;
  label: string;
  onClick?: () => void;
  labelIsHidden?: boolean;
  isDisabled?: boolean;
};

const HeaderButton = ({
  icon,
  label,
  labelIsHidden,
  onClick,
  isDisabled,
}: HeaderButtonProps) => (
  <Label>
    <HeaderIconButton
      variant="secondary"
      colorScheme="gray"
      icon={icon}
      aria-label={label}
      onClick={onClick}
      isDisabled={isDisabled}
    />
    {!labelIsHidden && label}
  </Label>
);

const HeaderIconButton = styled(IconButton)`
  width: unset;
  height: unset;
  padding: 5px;

  & > .material-symbols-rounded {
    font-size: var(--kvib-fontSizes-lg);
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  cursor: pointer;
`;

export default HeaderButton;
