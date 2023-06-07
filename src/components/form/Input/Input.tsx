import { forwardRef, InputHTMLAttributes } from "react";
import styled, { css } from "styled-components";
import Label from "../Label";
import Message from "components/Status/Message";

export type ValidationError = {
  message: string;
  showError: boolean;
};

type Props = {
  label?: string;
  validationError?: ValidationError;
} & InputHTMLAttributes<HTMLInputElement>;

const StyledInput = styled.input<{ isInvalid: boolean }>`
  font-size: 16px;
  padding: 16px;
  border: 1px solid;
  border-radius: 4px;
  background: var(--white);
  transition: border-color 0.1s, box-shadow 0.1s;

  &:active,
  &:focus {
    border-color: var(--blue);
    box-shadow: inset 0 0 0 1px var(--blue);
    outline: 0;
  }

  &:disabled {
    background: var(--gray_light);
    color: var(--gray_dark);
    opacity: 0.7;

    &:active,
    &:focus {
      box-shadow: none;
    }
  }

  ${(props) =>
    props.isInvalid &&
    css`
      border-color: var(--red_error_message);
      box-shadow: inset 0 0 0 1px var(--red_error_message);
    `};

  // https://stackoverflow.com/questions/14946091/are-there-any-style-options-for-the-html5-date-picker
  &[type="date"] {
    &::-webkit-calendar-picker-indicator {
      padding: 0;
    }

    &::-webkit-datetime-edit-fields-wrapper {
      padding: 0;
    }
  }
`;

const Input = forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  return (
    <Label className={props.className} label={props.label ?? ""}>
      <StyledInput
        {...props}
        ref={ref}
        isInvalid={props.validationError?.showError ?? false}
      />
      {props.validationError?.showError && (
        <Message status="error">{props.validationError.message}</Message>
      )}
    </Label>
  );
});

export default Input;
