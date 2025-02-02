import { Button, ButtonProps, IconButton, MaterialSymbol, Tooltip } from "@kvib/react";
import { CustomTooltipProps, TooltipBody } from "../Toolbar/CustomTooltip";
import { styled } from "styled-components";
import { forwardRef, ReactNode } from "react";

type HeaderButtonProps = {
  icon?: MaterialSymbol; // Made optional
  onClick?: () => void;
  isDisabled?: boolean;
  tooltip?: CustomTooltipProps;
  label: string;
  isLabelHidden?: boolean;
  alert?: ReactNode;
} & ButtonProps;

const HeaderButtonNoTooltip = forwardRef(function HeaderButtonWithNoTooltip(
  { icon, label, onClick, isDisabled, isLabelHidden = false, alert, ...props }: Omit<HeaderButtonProps, "tooltip">,
  ref,
) {
  return isLabelHidden ? (
    <IconButton
      ref={ref}
      size="sm"
      variant="ghost"
      icon={icon ?? "home"} // Ensure IconButton always has an icon
      aria-label={label}
      onClick={onClick}
      isDisabled={isDisabled}
      {...props}
    />
  ) : (
    <Button
      ref={ref}
      size="sm"
      variant="ghost"
      leftIcon={icon} // Use leftIcon only if icon is provided
      onClick={onClick}
      isDisabled={isDisabled}
      {...props}
    >
      <ButtonContent>
        {label} {alert}
      </ButtonContent>
    </Button>
  );
});

const HeaderButton = ({ tooltip, ...props }: HeaderButtonProps) => {
  if (tooltip != null) {
    return (
      <Tooltip label={<TooltipBody text={tooltip.text} shortcut={tooltip.shortcut} />}>
        <HeaderButtonNoTooltip {...props} />
      </Tooltip>
    );
  }
  return <HeaderButtonNoTooltip {...props} />;
};

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const HeaderSection = styled.section`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export default HeaderButton;
