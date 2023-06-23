import { forwardRef } from "react";
import Label from "../Label";
import Message from "components/Status/Message";
import { InputProps, Input as KvibInput } from "@kvib/react";

export type ValidationError = {
  message: string;
  showError: boolean;
};

type Props = {
  label?: string;
  validationError?: ValidationError;
} & InputProps;

// TODO: bytt ut med kvib via formcontrol osv
const InnerInput = (
  { className, label, validationError, ...props }: Props,
  ref: React.ForwardedRef<HTMLSelectElement>
) => (
  <Label className={className} label={label ?? ""}>
    <KvibInput
      ref={ref}
      isInvalid={validationError?.showError ?? false}
      {...props}
    />
    {validationError?.showError && (
      <Message status="error">{validationError.message}</Message>
    )}
  </Label>
);

const InputWithLabel = forwardRef(InnerInput);

export default InputWithLabel;
