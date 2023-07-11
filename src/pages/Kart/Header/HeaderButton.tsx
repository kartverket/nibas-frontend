import { IconButton } from "@kvib/react";
import Icon from "components/Icon";
import styled from "styled-components";

type HeaderButtonProps = {
  icon: string;
  label: string;
  labelIsHidden?: boolean;
};

const HeaderButton = ({ icon, label, labelIsHidden }: HeaderButtonProps) => (
  <Label>
    <IconButton
      variant="outline"
      colorScheme="gray"
      icon={<Icon icon={icon} />}
      aria-label={label}
    />
    {!labelIsHidden && label}
  </Label>
);

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;

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
