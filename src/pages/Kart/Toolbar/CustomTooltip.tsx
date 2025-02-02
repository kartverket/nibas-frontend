import { Icon, MaterialSymbol, Stack, Text, Tooltip, TooltipProps } from "@kvib/react";
import { styled } from "styled-components";
import { KeyboardShortcuts, Shortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts";

export type CustomTooltipProps = {
  text: string;
  icon?: MaterialSymbol;
  additionalInfo?: string;
} & ShortcutTextProps;

type ShortcutTextProps = {
  shortcut?: Shortcut;
  holdButton?: string;
};

type Props = CustomTooltipProps & Omit<TooltipProps, "label">;

const ShortcutText = ({ shortcut, holdButton }: ShortcutTextProps) => {
  const shortcutString = shortcut ? KeyboardShortcuts[shortcut].displayString : null;

  if (shortcutString != null && holdButton != null) {
    return (
      <ShortcutTextStyle>
        {shortcutString} eller hold inne {holdButton}
      </ShortcutTextStyle>
    );
  } else if (holdButton != null) {
    return <ShortcutTextStyle>Hold inne {holdButton}</ShortcutTextStyle>;
  } else if (shortcutString != null) {
    return <ShortcutTextStyle>{shortcutString}</ShortcutTextStyle>;
  }
  return null;
};

export const TooltipBody = ({ text, icon, shortcut, holdButton, additionalInfo }: CustomTooltipProps) => (
  <BodyWrapper>
    <IconText>
      {text}

      {icon && <Icon size={24} icon={icon} />}
    </IconText>
    <ShortcutText shortcut={shortcut} holdButton={holdButton} />
    {additionalInfo != null && <ShortcutTextStyle>{additionalInfo}</ShortcutTextStyle>}
  </BodyWrapper>
);

const CustomTooltip = ({ text, icon, shortcut, children, holdButton, additionalInfo, ...restProps }: Props) => {
  return (
    <Tooltip
      placement="top"
      {...restProps}
      label={
        <TooltipBody
          text={text}
          shortcut={shortcut}
          holdButton={holdButton}
          icon={icon}
          additionalInfo={additionalInfo}
        />
      }
    >
      <div>{children}</div>
    </Tooltip>
  );
};

export default CustomTooltip;

const ShortcutTextStyle = styled(Text)`
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
