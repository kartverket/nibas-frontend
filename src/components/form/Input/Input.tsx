import { forwardRef, InputHTMLAttributes } from "react";
import styled from "styled-components";

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  return <StyledInput {...props} ref={ref} />;
});

const StyledInput = styled.input`
  padding: 8px;
  font-size: 14px;
  border-width: 1px;
  border-radius: 3px;
  border: 1px solid var(--black);
  background-color: var(--white);

  &:active,
  &:focus {
    border-color: var(--blue);
    box-shadow: inset 0 0 2px var(--blue);
    outline: 0;
  }

  &:disabled {
    background-color: var(--gray_light);
    border-color: var(--gray_dark);
    color: var(--gray_dark);
    opacity: 0.7;

    &:active,
    &:focus {
      box-shadow: none;
    }
  }

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

export default Input;
