import { InputHTMLAttributes } from "react";
import styled from "styled-components";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  min: number;
  max: number;
  value: number;
};

// vi trenger ikke type inn til input, fordi den er bestemt av StyledSlider
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Slider = ({ type, ...props }: Props) => {
  return <StyledSlider {...props} />;
};

// https://www.w3schools.com/howto/howto_js_rangeslider.asp
const StyledSlider = styled.input.attrs(() => ({
  type: "range",
}))`
  appearance: none;
  width: 100%; /* Full-width */
  height: 4px; /* Specified height */
  background: ${({ theme }) => theme.colors.blueDark}; /* Grey background */
  outline: none; /* Remove outline */
  opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
  transition: opacity 0.2s;

  :hover {
    opacity: 1; /* Fully shown on mouse-over */
  }

  /* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
  ::-webkit-slider-thumb {
    appearance: none;
    width: 18px; /* Set a specific slider handle width */
    height: 18px; /* Slider handle height */
    background: ${({ theme }) => theme.colors.blueDark}; /* Green background */
    cursor: pointer; /* Cursor on hover */
  }

  ::-moz-range-thumb {
    width: 18px; /* Set a specific slider handle width */
    height: 18px; /* Slider handle height */
    background: ${({ theme }) => theme.colors.blueDark}; /* Green background */
    cursor: pointer; /* Cursor on hover */
  }
`;

export default Slider;
