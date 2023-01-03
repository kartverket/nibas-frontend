import { forwardRef, TextareaHTMLAttributes } from "react";
import styled from "styled-components";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  props,
  ref
) {
  return <StyledTextarea {...props} ref={ref} />;
});

const StyledTextarea = styled.textarea`
  padding: 8px;
  font-size: 14px;
  border-width: 1px;
  border-radius: 3px;
  border: 1px solid var(--black);
  background-color: var(--white);
  font-family: "Mulish";

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
`;

export default Textarea;
