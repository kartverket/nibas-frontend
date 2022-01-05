import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { KodelisteItem } from "../../api/kodelister";
import CaretDownIcon from "icons/caretdown.svg";

type KodelisteSelectProps = {
  id: string;
  name: string;
  label: string;
  selectedValue?: string;
  showSelectedText?: boolean;
  fetchKodeListeFunction: () => Promise<KodelisteItem[]>;
};

const KodelisteSelect: React.FC<KodelisteSelectProps> = ({
  id,
  name,
  label,
  selectedValue = "",
  showSelectedText = false,
  fetchKodeListeFunction,
}) => {
  // De mulige kodeliste-valgene
  const [kodelisteItems, setKodelisteItems] = useState<KodelisteItem[]>([]);
  // Holder på valgt UUID
  const [selection, setSelection] = useState<string>(selectedValue);

  useEffect(() => {
    (async () => {
      setKodelisteItems(await fetchKodeListeFunction());
    })();
  }, [fetchKodeListeFunction]);

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
        <label htmlFor={id}>
          {label} ({kodelisteItems.length} valg)
        </label>
      </LabelWrapper>
      <SelectWrapper>
        <SelectInput
          name={name}
          id={id}
          value={selection}
          onChange={handleChange}
        >
          {kodelisteItems.map((kodelisteItem) => {
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
  margin: 0.3em 0;
  font-weight: bold;
`;

const SelectInput = styled.select`
  border: 1px solid #000;
  border-radius: 3px;
  box-sizing: border-box;
  padding: 8px 44px 8px 16px; //Høyre padding er større for å få plass til ikon
  margin: 0;
  width: 100%;
  height: 44px;
  appearance: none;

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
