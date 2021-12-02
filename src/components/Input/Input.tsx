import { InputHTMLAttributes } from "react";
import styled from "styled-components";

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input = (props: Props) => {
  return <Wrapper {...props} />;
};

const Wrapper = styled.input`
  padding: 8px;
  font-size: 14px;
`;

export default Input;
