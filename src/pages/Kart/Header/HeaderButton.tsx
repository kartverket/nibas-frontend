import { Button, ButtonProps, IconButton, MaterialSymbol, Tooltip } from "@kvib/react";
import { CustomTooltipProps, TooltipBody } from "../Toolbar/CustomTooltip";
import { styled } from "styled-components";
import { ReactNode } from "react";

type HeaderButtonProps = {
  icon: MaterialSymbol;
  onClick?: () => void;
  isDisabled?: boolean;
  tooltip: CustomTooltipProps;
  label: string;
  isLabelHidden?: boolean;
  alert?: ReactNode;
} & ButtonProps;

const HeaderButton = ({
  icon,
  label,
  onClick,
  isDisabled,
  tooltip,
  isLabelHidden = false,
  alert,
  ...props
}: HeaderButtonProps) => (
  <Tooltip hasArrow label={<TooltipBody text={tooltip.text} shortcut={tooltip.shortcut} />}>
    {isLabelHidden ? (
      <IconButton
        size="sm"
        variant="ghost"
        icon={icon}
        aria-label={label}
        onClick={onClick}
        isDisabled={isDisabled}
        {...props}
      />
    ) : (
      <Button size="sm" variant="ghost" leftIcon={icon} onClick={onClick} isDisabled={isDisabled} {...props}>
        <ButtonContent>
          {label} {alert}
        </ButtonContent>
      </Button>
    )}
  </Tooltip>
);

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
