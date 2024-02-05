import { FieldError } from "react-hook-form";
import { VedtakinfoRow } from "./VedtakinfoRow";
import { FormControl, Text } from "@kvib/react";

export const VedtakinfoField = ({
  displayMode,
  tooltipLabel,
  title,
  value,
  children,
  isRequired = false,
  errors,
}: {
  displayMode: boolean;
  tooltipLabel: string;
  title: string;
  value?: string;
  children: React.ReactNode;
  isRequired?: boolean;
  errors: FieldError | undefined;
}) => {
  return (
    <FormControl isRequired={isRequired}>
      <VedtakinfoRow tooltipLabel={tooltipLabel} name={title} errors={errors}>
        {displayMode ? <Text>{value}</Text> : children}
      </VedtakinfoRow>
    </FormControl>
  );
};
