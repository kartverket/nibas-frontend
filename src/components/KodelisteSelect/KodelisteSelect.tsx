import React, { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import useSWR from "swr";
import { KodelisteItem } from "../../api/kodelister";
import Select from "components/form/Select";
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
      <Select name={name} id={id} value={selection} onChange={handleChange}>
        {kodelisteItems?.sort(sortFunction).map((kodelisteItem) => {
          const item = kodelisteItem.item;
          return (
            <option key={item.uuid} value={item.uuid}>
              {item.codevalue} - {item.label}
            </option>
          );
        })}
      </Select>
      {getSelectedText()}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 8px 0;
`;

const LabelWrapper = styled.div`
  label {
    color: var(--gray_dark);
    display: inline-block;
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 8px;
    white-space: pre-line;
  }
`;

export default KodelisteSelect;
