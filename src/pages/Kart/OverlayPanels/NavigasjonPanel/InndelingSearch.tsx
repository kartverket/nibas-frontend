import { Badge, SearchAsync, Text } from "@kvib/react";
import { FormatOptionLabelMeta } from "chakra-react-select";
import { ReactNode, useState } from "react";
import { styled } from "styled-components";
import { InndelingResponse } from "types/api";
import { NavigasjonProps } from "./NavigasjonPanel";
import { useInndelingerSearch } from "./useInndelingerSearch";

type InndelingOption = InndelingResponse & {
  label: string;
};

export const InndelingSearch = ({ onSelect: centerOnCoordinate }: NavigasjonProps) => {
  const searchInndelinger = useInndelingerSearch();
  const [selectedInndeling, setSelectedInndeling] = useState<InndelingOption | null>();

  const mapInndelingResponseToOption = ({
    id,
    type,
    navn,
    nummer,
    representasjonspunkt,
  }: InndelingResponse): InndelingOption => {
    return {
      id,
      navn,
      nummer,
      type,
      representasjonspunkt,
      label: `${nummer} ${navn}`,
    };
  };

  const handleOnChange = (inndeling: InndelingOption | null) => {
    const north = inndeling?.representasjonspunkt.y;
    const east = inndeling?.representasjonspunkt.x;
    if (north != null && east != null) {
      centerOnCoordinate(north, east);
      setSelectedInndeling(null);
    }
  };

  const loadResults = async (term: string, resultsCallback: (options: InndelingOption[]) => void) => {
    if (term.length > 1) {
      const inndelinger = await searchInndelinger(term, 15);
      resultsCallback(inndelinger.map(mapInndelingResponseToOption));
    }
  };

  const noOptionMessage = (obj: { inputValue: string }): ReactNode => {
    return obj.inputValue !== "" ? (
      <ErrorMessage>{`Fant ingen inndeling som matchet "${obj.inputValue}"`}</ErrorMessage>
    ) : null;
  };

  const FormattedOption = ({ label, type }: { label: ReactNode; type: string }) => {
    return (
      <OptionContainer>
        <Text>{label}</Text>
        <Badge colorScheme="gray">{type}</Badge>
      </OptionContainer>
    );
  };

  const highlightAndBadgeLabelFormatter = (
    inndeling: InndelingOption,
    formatOptionLabelMeta: FormatOptionLabelMeta<InndelingOption>,
  ) => {
    const inputValue = formatOptionLabelMeta.inputValue;
    const label = inndeling.label;
    const labelRegex = new RegExp(`(${inputValue})`, "gi");

    const match = label.match(labelRegex);

    if (!match) return <FormattedOption label={label} type={inndeling.type} />;

    const index = label.indexOf(match[0]);
    const beforeMatch = label.slice(0, index);
    const matchedPart = match[0];
    const afterMatch = label.slice(index + matchedPart.length);

    return (
      <FormattedOption
        label={
          <>
            {beforeMatch}
            <b>{matchedPart}</b>
            {afterMatch}
          </>
        }
        type={inndeling.type}
      />
    );
  };

  return (
    <SearchAsync
      value={selectedInndeling}
      optionLabelFormatter={highlightAndBadgeLabelFormatter}
      size={"md"}
      placeholder="Skriv inn navnet eller nummeret til inndelingen"
      noOptionsMessage={noOptionMessage}
      onChange={handleOnChange}
      loadOptions={loadResults}
      debounceTime={150}
    />
  );
};

const ErrorMessage = styled.div`
  padding: 2px 16px;
`;

const OptionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;
