import { VedtakinfoRow } from "./VedtakinfoRow";
import { FormControl, Text } from "@kvib/react";

export const VedtakinfoField = ({
  displayMode,
  tooltipLabel,
  title,
  value,
  children,
  isRequired = false,
}: {
  displayMode: boolean;
  tooltipLabel: string;
  title: string;
  value?: string;
  children: React.ReactNode;
  isRequired?: boolean;
}) => {
  return (
    <FormControl isRequired={isRequired}>
      <VedtakinfoRow tooltipLabel={tooltipLabel} name={title}>
        {displayMode ? <Text>{value}</Text> : children}
      </VedtakinfoRow>
    </FormControl>
  );
};
