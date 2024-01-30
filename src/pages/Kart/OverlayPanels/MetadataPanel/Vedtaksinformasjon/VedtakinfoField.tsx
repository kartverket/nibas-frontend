import { VedtakinfoRow } from "./VedtakinfoRow";
import { Text } from "@kvib/react";

export const VedtakinfoField = ({
  displayMode,
  tooltipLabel,
  title,
  value,
  children,
}: {
  displayMode: boolean;
  tooltipLabel: string;
  title: string;
  value?: string;
  children: React.ReactNode;
}) => {
  return (
    <VedtakinfoRow tooltipLabel={tooltipLabel} name={title}>
      {displayMode ? <Text>{value}</Text> : children}
    </VedtakinfoRow>
  );
};
