import { forwardRef, SelectHTMLAttributes } from "react";
import styled from "styled-components";
import Icon from "components/Icon";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  props,
  ref
) {
  return (
    <SelectWrapper>
      <SelectInput {...props} ref={ref}></SelectInput>
      <SelectCaret />
    </SelectWrapper>
  );
});

const SelectInput = styled.select`
  appearance: none;
  border: 1px solid var(--black);
  background-color: var(--white);
  border-radius: 3px;
  padding: 8px 44px 8px 8px;
  margin: 0;
  width: 100%;
  font-size: 14px;
  margin-bottom: 8px;

  option {
    &:nth-child(even) {
      background-color: var(--blue_light);
    }
  }

  &:hover {
    border-color: var(--blue);
  }

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

const SelectCaret = styled(Icon).attrs(() => ({
  icon: "expand_more",
}))`
  font-size: 24px;
  top: 7px;
  right: 7px;
  position: absolute;
  pointer-events: none;
`;

const SelectWrapper = styled.div`
  position: relative;

  &.invalid {
    select {
      border-color: var(--red_error_message);

      &:active,
      &:focus {
        box-shadow: inset 0 0 2px var(--red_error_message);
      }
    }

    ${SelectCaret} {
      color: var(--red_error_message);
    }
  }
`;

export default Select;
