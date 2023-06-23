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
const Input = forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  return (
    <Label className={props.className} label={props.label ?? ""}>
      <KvibInput
        ref={ref}
        {...props}
        isInvalid={props.validationError?.showError ?? false}
      />
      {props.validationError?.showError && (
        <Message status="error">{props.validationError.message}</Message>
      )}
    </Label>
  );
});

export default Input;
