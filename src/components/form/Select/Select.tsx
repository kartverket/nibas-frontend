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
  border: 1px solid ${({ theme }) => theme.colors.black};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 3px;
  padding: 8px 44px 8px 8px;
  margin: 0;
  width: 100%;
  font-size: 14px;
  margin-bottom: 8px;

  option {
    &:nth-child(even) {
      background-color: ${({ theme }) => theme.colors.blueLight};
    }
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.blue};
  }

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
      border-color: ${({ theme }) => theme.colors.redErrorText};

      &:active,
      &:focus {
        box-shadow: inset 0 0 2px ${({ theme }) => theme.colors.redErrorText};
      }
    }

    ${SelectCaret} {
      color: ${({ theme }) => theme.colors.redErrorText};
    }
  }
`;

export default Select;
