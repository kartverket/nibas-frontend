import { SelectHTMLAttributes } from "react";
import styled from "styled-components";
import CaretDownIcon from "icons/caretdown.svg";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

const Select = (props: Props) => {
  return (
    <SelectWrapper>
      <SelectInput {...props}></SelectInput>
    </SelectWrapper>
  );
};

const SelectInput = styled.select`
  border: 1px solid #000;
  background-color: white;
  border-radius: 3px;
  box-sizing: border-box;
  padding: 8px 44px 8px 16px;
  margin: 0;
  width: 100%;
  height: 44px;
  appearance: none;
  font-size: 16px;

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
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.blue};
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

const SelectWrapper = styled.div`
  position: relative;

  &.invalid {
    select {
      border-color: ${({ theme }) => theme.colors.redErrorText};
      &:active,
      &:focus {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.redErrorText};
      }
    }
    &::after {
      color: ${({ theme }) => theme.colors.redErrorText};
    }
  }

  &::after {
    content: url("${CaretDownIcon}");
    font-size: 24px;
    top: 10px;
    right: 10px;
    position: absolute;
    pointer-events: none;
  }
`;

export default Select;
