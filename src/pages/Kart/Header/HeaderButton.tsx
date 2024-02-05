import { Button, MaterialSymbol, Tooltip } from "@kvib/react";
import { TooltipBody } from "../Toolbar/CustomTooltip";
import { Shortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts";

type HeaderButtonProps = {
  icon: MaterialSymbol;
  label: string;
  onClick?: () => void;
  labelIsHidden?: boolean;
  isDisabled?: boolean;
  tooltip: { text: string; shortcut?: Shortcut };
};

const HeaderButton = ({ icon, label, labelIsHidden, onClick, isDisabled, tooltip }: HeaderButtonProps) => (
  <Tooltip hasArrow label={<TooltipBody text={tooltip.text} shortcut={tooltip.shortcut} />} isDisabled={!tooltip}>
    <Button size="xs" variant="ghost" leftIcon={icon} aria-label={label} onClick={onClick} isDisabled={isDisabled}>
      {!labelIsHidden && label}
    </Button>
  </Tooltip>
);

export default HeaderButton;
