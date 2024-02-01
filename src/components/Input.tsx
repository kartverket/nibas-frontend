import { forwardRef } from "react";
import { FormControl, FormLabel, InputProps, Input, FormErrorMessage } from "@kvib/react";

export type ValidationError = {
    message: string;
    showError: boolean;
};

type Props = {
    label?: string;
    validationError?: ValidationError;
} & InputProps;

const InnerInput = (
    { className, label, validationError, ...props }: Props,
    ref: React.ForwardedRef<HTMLSelectElement>,
) => (
    <FormControl isInvalid={validationError?.showError}>
        {label && <FormLabel>{label}</FormLabel>}
        <Input className={className} ref={ref} {...props} />
        <FormErrorMessage>{validationError?.message}</FormErrorMessage>
    </FormControl>
);

const InputWithLabel = forwardRef(InnerInput);

export default InputWithLabel;
