import { forwardRef, InputHTMLAttributes } from "react";
import styled from "styled-components";

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  return <Wrapper {...props} ref={ref} />;
});

const Wrapper = styled.input`
  padding: 8px;
  font-size: 14px;
`;

export default Input;
