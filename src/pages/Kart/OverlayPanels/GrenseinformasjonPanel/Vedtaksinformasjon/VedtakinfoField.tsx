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
  errors: FieldError | undefined;
  errorMessage?: string | undefined;
  maxWidth?: string;
};

export const VedtakinfoField = ({
  formViewState,
  tooltipLabel,
  title,
  value,
  children,
  isRequired = false,
  errors,
  errorMessage = undefined,
  maxWidth = "290px",
}: FieldProps) => {
  return (
    <FormControl isRequired={isRequired}>
      <VedtakinfoRow tooltipLabel={tooltipLabel} name={title} errors={errors} errorMessage={errorMessage}>
        {formViewState === "viewing" ? (
          <Text paddingTop={"8px"} paddingBottom={"8px"} maxWidth={maxWidth}>
            {value}
          </Text>
        ) : (
          children
        )}
      </VedtakinfoRow>
    </FormControl>
  );
};
