import { InputHTMLAttributes } from "react";
import styled from "styled-components";

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input = (props: Props) => {
  return <Wrapper {...props} />;
};

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

    &:active,
    &:focus {
      box-shadow: none;
    }
  }
`;

export default Input;
