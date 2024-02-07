import { Hide, Show, ShowProps } from "@kvib/react";

type Props = {
  condition: boolean;
} & ShowProps;

export const ConditionalShow = ({ condition, children, ...props }: Props) =>
  condition ? <Show {...props}>{children}</Show> : children;

export const ConditionalHide = ({ condition, children, ...props }: Props) =>
  condition ? <Hide {...props}>{children}</Hide> : children;
