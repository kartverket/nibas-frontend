import React, { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import useSWR from "swr";
import { KodelisteItem } from "../../api/kodelister";
import CaretDownIcon from "icons/caretdown.svg";
import { fetcherWithToken } from "utils/swr";

type KodelisteSelectProps = {
  id: string;
  name: string;
  label: string;
  selectedValue?: string;
  showSelectedText?: boolean;
  sortFunction?: (a: KodelisteItem, b: KodelisteItem) => number;
  kodelisteUrl: string;
};

const defaultSortFunction = (a: KodelisteItem, b: KodelisteItem) =>
  parseInt(a.item.codevalue, 10) - parseInt(b.item.codevalue, 10);

const KodelisteSelect = ({
  id,
  name,
  label,
  selectedValue = "",
  showSelectedText = false,
  sortFunction = defaultSortFunction,
  kodelisteUrl,
}: KodelisteSelectProps) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: kodelisteItems } = useSWR<KodelisteItem[]>(
    [kodelisteUrl, tokenHolderFunc()?.token],
    fetcherWithToken
  );

  // Holder på valgt UUID
  const [selection, setSelection] = useState<string>(selectedValue);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelection(event.target.value as string);
  };

  function getSelectedText() {
    if (showSelectedText) {
      return <div>Selected value: {selection}</div>;
    }
  }

  return (
    <Wrapper>
      <LabelWrapper>
        <label htmlFor={id}>{label}</label>
      </LabelWrapper>
      <SelectWrapper>
        <SelectInput
          name={name}
          id={id}
          value={selection}
          onChange={handleChange}
        >
          {kodelisteItems?.sort(sortFunction).map((kodelisteItem) => {
            const item = kodelisteItem.item;
            return (
              <option key={item.uuid} value={item.uuid}>
                {item.codevalue} - {item.label}
              </option>
            );
          })}
        </SelectInput>
      </SelectWrapper>
      {getSelectedText()}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 8px 0;
`;

const LabelWrapper = styled.div`
  label {
    color: ${(props) => props.theme.colors.gray1};
    display: inline-block;
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 8px;
    white-space: pre-line;
  }
`;

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

  option {
    &:nth-child(even) {
      background-color: ${(props) => props.theme.colors.blueLight};
    }
  }

  &:hover {
    border-color: ${(props) => props.theme.colors.blue};
  }

  &:active,
  &:focus {
    border-color: ${(props) => props.theme.colors.blue};
    box-shadow: 0 0 0 2px ${(props) => props.theme.colors.blue};
    outline: 0;
  }

  &:disabled {
    background-color: ${(props) => props.theme.colors.grayLight};
    border-color: ${(props) => props.theme.colors.gray1};
    color: ${(props) => props.theme.colors.gray2};
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
      border-color: ${(props) => props.theme.colors.redErrorText};
      &:active,
      &:focus {
        box-shadow: 0 0 0 2px ${(props) => props.theme.colors.redErrorText};
      }
    }
    &::after {
      color: ${(props) => props.theme.colors.redErrorText};
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

export default KodelisteSelect;
