import { forwardRef, InputHTMLAttributes } from "react";
import styled from "styled-components";

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  return <Wrapper {...props} ref={ref} />;
});

const Wrapper = styled.input`
  padding: 8px;
  font-size: 14px;
  border-width: 1px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.colors.black};
  background-color: ${({ theme }) => theme.colors.white};

  &:active,
  &:focus {
    border-color: ${({ theme }) => theme.colors.blue};
    box-shadow: inset 0 0 2px ${({ theme }) => theme.colors.blue};
    outline: 0;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.grayLight};
    border-color: ${({ theme }) => theme.colors.gray1};
    color: ${({ theme }) => theme.colors.gray2};
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
