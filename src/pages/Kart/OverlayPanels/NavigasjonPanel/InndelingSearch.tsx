import { Badge, SearchAsync, Text } from "@kvib/react";
import { FormatOptionLabelMeta } from "chakra-react-select";
import { ReactNode, useState } from "react";
import { styled } from "styled-components";
import { InndelingSearchResponse } from "types/api";
import { NavigasjonProps } from "./NavigasjonPanel";
import { useInndelingerSearch } from "./useInndelingerSearch";

type InndelingOption = InndelingSearchResponse & {
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
  }: InndelingSearchResponse): InndelingOption => {
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
      if (inndelinger !== null) {
        resultsCallback(inndelinger.map(mapInndelingResponseToOption));
      }
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
    // Sikre at input-verdi er escapet for bruk i RegExp
    const escapedInputValue = formatOptionLabelMeta.inputValue
      .replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
      .replace(/-/g, "\\x2d");

    const labelRegExp = new RegExp(`(.*)(${escapedInputValue})(.*)`, "i");
    const matches = inndeling.label.match(labelRegExp);

    if (!matches) return <FormattedOption label={inndeling.label} type={inndeling.type} />;

    return (
      <FormattedOption
        label={
          <>
            {matches[1]}
            <strong>{matches[2]}</strong>
            {matches[3]}
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
      placeholder="Skriv inn navnet eller nummeret til inndelingen"
      noOptionsMessage={noOptionMessage}
      onChange={handleOnChange}
      loadOptions={loadResults}
      debounceTime={150}
      autoFocus
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
