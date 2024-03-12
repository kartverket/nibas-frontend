import { FieldError } from "react-hook-form";
import { VedtakinfoRow } from "./VedtakinfoRow";
import { FormControl, Text } from "@kvib/react";
import { FormViewState } from "./Vedtaksinformasjon";

type FieldProps = {
  formViewState: FormViewState;
  tooltipLabel: string;
  title: string;
  value?: string;
  children: React.ReactNode;
  isRequired?: boolean;
  error: FieldError | undefined;
  maxWidth?: string;
};

export const VedtakinfoField = ({
  formViewState,
  tooltipLabel,
  title,
  value,
  children,
  isRequired = false,
  error,
  maxWidth = "290px",
}: FieldProps) => {
  return (
    <FormControl isRequired={formViewState !== "viewing" ? isRequired : false} isInvalid={!!error}>
      <VedtakinfoRow isRequired={isRequired} tooltipLabel={tooltipLabel} name={title} error={error}>
        {formViewState === "viewing" ? (
          <Text paddingTop="8px" paddingBottom="8px" maxWidth={maxWidth}>
            {value}
          </Text>
        ) : (
          children
        )}
      </VedtakinfoRow>
    </FormControl>
  );
};
