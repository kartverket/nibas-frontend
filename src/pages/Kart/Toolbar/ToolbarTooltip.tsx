import { Stack, Text, Tooltip, TooltipProps } from "@kvib/react";
import styled from "styled-components";
import {
  KeyboardShortcuts,
  Shortcut,
} from "hooks/keyboard-shortcuts/keyboard-shortcuts";

type BodyProps = {
  text: string;
  shortcut?: Shortcut;
};

type Props = BodyProps & Omit<TooltipProps, "label">;

const TooltipBody = ({ text, shortcut }: BodyProps) => (
  <BodyWrapper>
    <Text>{text}</Text>
    {shortcut && (
      <ShortcutText>{KeyboardShortcuts[shortcut].displayString}</ShortcutText>
    )}
  </BodyWrapper>
);

const ToolbarTooltip = ({ text, shortcut, children, ...restProps }: Props) => {
  return (
    <Tooltip
      hasArrow
      placement="top"
      {...restProps}
      label={<TooltipBody text={text} shortcut={shortcut} />}
    >
      <div>{children}</div>
    </Tooltip>
  );
};

export default ToolbarTooltip;

const ShortcutText = styled(Text)`
  font-style: italic;
  font-size: 12px;
`;

const BodyWrapper = styled(Stack)`
  padding: 12px;
`;
