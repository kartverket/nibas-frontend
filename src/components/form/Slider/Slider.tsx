import { forwardRef, InputHTMLAttributes } from "react";
import styled from "styled-components";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  min: number;
  max: number;
  value: number;
};

// vi trenger ikke type inn til input, fordi den er bestemt av StyledSlider
const Slider = forwardRef<HTMLInputElement, Props>(function Slider(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { type, ...props },
  ref
) {
  return <StyledSlider {...props} ref={ref} />;
});

// https://www.w3schools.com/howto/howto_js_rangeslider.asp
const StyledSlider = styled.input.attrs(() => ({
  type: "range",
}))`
  appearance: none;
  width: 100%; /* Full-width */
  height: 4px; /* Specified height */
  background: var(--blue_dark); /* Grey background */
  outline: none; /* Remove outline */

  /* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
  ::-webkit-slider-thumb {
    appearance: none;
    border-radius: 50%;
    width: 18px; /* Set a specific slider handle width */
    height: 18px; /* Slider handle height */
    background-color: var(--white) /* Green background-color */
    border: 1px solid var(--blue_dark);
    cursor: pointer; /* Cursor on hover */
    transition: 0.2 all;

    :hover {
      background-color: var(--blue_dark);
    }
  }

  ::-moz-range-thumb {
    border-radius: 50%;
    width: 18px; /* Set a specific slider handle width */
    height: 18px; /* Slider handle height */
    background-color: var(--white); /* Green background-color */
    border: 3px solid var(--blue_dark);
    cursor: pointer; /* Cursor on hover */
    transition: 0.2 all;

    :hover {
      background-color: var(--blue_dark);
    }
  }
`;

export default Slider;
