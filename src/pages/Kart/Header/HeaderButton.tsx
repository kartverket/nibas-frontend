import { IconButton } from "@kvib/react";
import { styled } from "styled-components";

type HeaderButtonProps = {
  icon: string;
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
    <IconButton
      variant="outline"
      colorScheme="gray"
      icon={icon}
      aria-label={label}
      onClick={onClick}
      isDisabled={isDisabled}
    />
    {!labelIsHidden && label}
  </Label>
);

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  cursor: pointer;

  & > button {
    height: unset;
    min-width: unset;
    padding: 5px;

    & > span {
      font-size: var(--kvib-fontSizes-lg);
    }
  }
`;

export default HeaderButton;
