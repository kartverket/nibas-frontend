import { MaterialSymbol, Menu } from "@kvib/react";
import MenuButtonWithChevron from "pages/Kart/Toolbar/MenuButtonWithChevron";
import { ReactNode } from "react";

type ToolbarMenuProps = {
  label: string;
  icon: MaterialSymbol;
  isDisabled: boolean;
  isActive: boolean;
  tooltip: string;
  size?: string;
  children: ReactNode;
  additionalTooltip?: string;
};

export const ToolbarMenu = ({
  label,
  icon,
  size,
  isDisabled,
  isActive,
  tooltip,
  additionalTooltip,
  children,
}: ToolbarMenuProps) => (
  <Menu autoSelect={false}>
    {({ isOpen }) => (
      <>
        <MenuButtonWithChevron
          aria-label={tooltip}
          isOpen={isOpen}
          icon={icon}
          size={size}
          isDisabled={isDisabled}
          isActive={isActive}
          tooltip={{ text: tooltip, additionalInfo: additionalTooltip }}
        >
          {label}
        </MenuButtonWithChevron>
        {children}
      </>
    )}
  </Menu>
);
