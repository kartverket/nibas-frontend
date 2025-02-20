import { forwardRef } from "react";
import { Field, FormLabel, InputProps, Input, FormErrorMessage } from "@kvib/react";

export type ValidationError = {
  message: string;
  showError: boolean;
};

type Props = {
  label?: string;
  validationError?: ValidationError;
} & InputProps;

const InnerInput = (
  { className, label = "", validationError, ...props }: Props,
  ref: React.ForwardedRef<HTMLInputElement>,
) => (
  <Field invalid={validationError?.showError}>
    {label && <FormLabel>{label}</FormLabel>}
    <Input className={className} ref={ref} {...props} />
    <FormErrorMessage>{validationError?.message}</FormErrorMessage>
  </Field>
);

const InputWithLabel = forwardRef(InnerInput);

export default InputWithLabel;
