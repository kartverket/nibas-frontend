import { IconButton, MaterialSymbol, Tooltip } from "@kvib/react";
import { styled } from "styled-components";
import { TooltipBody } from "../Toolbar/ToolbarTooltip";
import { Shortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts";

type HeaderButtonProps = {
  icon: MaterialSymbol;
  label: string;
  onClick?: () => void;
  labelIsHidden?: boolean;
  isDisabled?: boolean;
  tooltip: { text: string; shortcut?: Shortcut };
};

const HeaderButton = ({
  icon,
  label,
  labelIsHidden,
  onClick,
  isDisabled,
  tooltip,
}: HeaderButtonProps) => (
  <Label>
    <Tooltip
      hasArrow
      label={<TooltipBody text={tooltip.text} shortcut={tooltip.shortcut} />}
      isDisabled={!tooltip}
    >
      <HeaderIconButton
        variant="secondary"
        colorScheme="gray"
        icon={icon}
        aria-label={label}
        onClick={onClick}
        isDisabled={isDisabled}
      />
    </Tooltip>
    {!labelIsHidden && label}
  </Label>
);

const HeaderIconButton = styled(IconButton)`
  min-width: unset;
  height: unset;
  padding: 5px;

  & > .material-symbols-rounded {
    font-size: var(--kvib-fontSizes-lg) !important;
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
