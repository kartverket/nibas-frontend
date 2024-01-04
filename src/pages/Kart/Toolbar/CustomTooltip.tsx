import {
  Icon,
  MaterialSymbol,
  Stack,
  Text,
  Tooltip,
  TooltipProps,
} from "@kvib/react";
import { styled } from "styled-components";
import {
  KeyboardShortcuts,
  Shortcut,
} from "hooks/keyboard-shortcuts/keyboard-shortcuts";

type BodyProps = {
  text: string;
  shortcut?: Shortcut;
  holdButton?: string;
  icon?: MaterialSymbol;
};

type Props = BodyProps & Omit<TooltipProps, "label">;

export const TooltipBody = ({
  text,
  icon,
  shortcut,
  holdButton,
}: BodyProps) => (
  <BodyWrapper>
    <IconText>
      {text}

      {icon && <Icon size={24} icon={icon} />}
    </IconText>
    {shortcut && (
      <ShortcutText>
        Trykk {KeyboardShortcuts[shortcut].displayString} på tastaturet
      </ShortcutText>
    )}
    {holdButton && (
      <ShortcutText>Hold inne {holdButton} på tastaturet</ShortcutText>
    )}
  </BodyWrapper>
);

const CustomTooltip = ({
  text,
  icon,
  shortcut,
  children,
  holdButton,
  ...restProps
}: Props) => {
  return (
    <Tooltip
      hasArrow
      placement="top"
      {...restProps}
      label={
        <TooltipBody
          text={text}
          shortcut={shortcut}
          holdButton={holdButton}
          icon={icon}
        />
      }
    >
      <div>{children}</div>
    </Tooltip>
  );
};

export default CustomTooltip;

const ShortcutText = styled(Text)`
  font-style: italic;
  font-size: 12px;
`;

const BodyWrapper = styled(Stack)`
  padding: 12px;
`;

const IconText = styled(Text)`
  display: flex;
  align-items: center;
  gap: 6px;
`;
