import { Button, ButtonProps, IconButton, MaterialSymbol, Tooltip } from "@kvib/react";
import { CustomTooltipProps, TooltipBody } from "../Toolbar/CustomTooltip";
import { styled } from "styled-components";
import { ReactNode, ForwardRefRenderFunction } from "react";

type HeaderButtonProps = {
  icon: MaterialSymbol;
  onClick?: () => void;
  isDisabled?: boolean;
  tooltip?: CustomTooltipProps;
  label: string;
  isLabelHidden?: boolean;
  alert?: ReactNode;
} & ButtonProps;

const HeaderButtonNoTooltip: ForwardRefRenderFunction<HTMLButtonElement, Omit<HeaderButtonProps, "tooltip">> = (
  { icon, label, onClick, isDisabled, isLabelHidden = false, alert, ...props },
  ref,
) => {
  return isLabelHidden ? (
    <IconButton
      ref={ref}
      size="sm"
      variant="ghost"
      icon={icon}
      aria-label={label}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    />
  ) : (
    <Button ref={ref} size="sm" variant="ghost" leftIcon={icon} onClick={onClick} disabled={isDisabled} {...props}>
      <ButtonContent>
        {label} {alert}
      </ButtonContent>
    </Button>
  );
};

const HeaderButton = ({ tooltip, ...props }: HeaderButtonProps) => {
  if (tooltip != null) {
    return (
      //{/* TODO: missing hasArrow prop */}
      <Tooltip hasArrow label={<TooltipBody text={tooltip.text} shortcut={tooltip.shortcut} />}>
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
  gap: 8px;
`;

export default HeaderButton;
