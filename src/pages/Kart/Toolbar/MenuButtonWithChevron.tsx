import { Icon, MenuButton } from "@kvib/react";
import ToolbarButton, { ToolbarButtonProps } from "pages/Kart/Toolbar/ToolbarButton";
import { forwardRef, JSX } from "react";
import { styled } from "styled-components";

type MenuButtonWithChevronProps = {
  isOpen: boolean;
  size?: string;
  icon?: JSX.Element;
} & Omit<ToolbarButtonProps, "icon">;

const MenuButtonWithChevron = (
  { children, size, isOpen, icon, ...props }: MenuButtonWithChevronProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) => {
  return (
    <MenuButton
      as={StyledToolbarButton}
      size={size}
      rightIcon={<Icon icon={isOpen ? "expand_less" : "expand_more"} />}
      ref={ref}
      icon={icon}
      {...props}
    >
      {children}
    </MenuButton>
  );
};

const StyledToolbarButton = styled(ToolbarButton)`
  background: inherit;
  display: flex;
  gap: 0;
  padding: 4px;
`;

export default forwardRef(MenuButtonWithChevron);
