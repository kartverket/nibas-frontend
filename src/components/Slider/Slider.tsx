import { InputHTMLAttributes } from "react";
import styled from "styled-components";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  min: number;
  max: number;
  value: number;
};

const Slider = ({ type, ...props }: Props) => {
  return <StyledSlider {...props} />;
};

const StyledSlider = styled.input.attrs(() => ({
  type: "range",
}))``;

export default Slider;
