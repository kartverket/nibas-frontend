import { Icon, InputProps, SearchAsync, Text } from "@kvib/react";
import { FormatOptionLabelMeta } from "chakra-react-select";
import { ReactNode, useMemo } from "react";
import { styled } from "styled-components";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";

type OptionType = { value: string; label: string };

type Props = Omit<InputProps, "onChange"> & {
  options: OptionType[];
  kretsType: KontekstType;
  onChange: (newId: string | undefined) => void;
};

const highlightFormatter = (option: OptionType, formatOptionLabelMeta: FormatOptionLabelMeta<OptionType>) => {
  // Sikre at input-verdi er escapet for bruk i RegExp
  const escapedInputValue = formatOptionLabelMeta.inputValue
    .replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
    .replace(/-/g, "\\x2d");

  const labelRegExp = new RegExp(`(.*)(${escapedInputValue})(.*)`, "i");
  const matches = option.label.match(labelRegExp);

  if (!matches)
    return (
      <OptionContainer>
        <Text>{option.label}</Text>
      </OptionContainer>
    );

  return (
    <OptionContainer>
      <Text>
        {matches[1]}
        <strong>{matches[2]}</strong>
        {matches[3]}
      </Text>
    </OptionContainer>
  );
};

export const TilhorighetSearch = ({ options, value, onChange, kretsType }: Props) => {
  const noOptionMessage = (obj: { inputValue: string }): ReactNode => {
    return obj.inputValue !== "" ? (
      <ErrorMessage>{`Fant ingen ${kretsType === KontekstType.GRUNNKRETS ? "grunnkretser" : "stemmekretser"} som matchet "${obj.inputValue}"`}</ErrorMessage>
    ) : null;
  };

  const loadResults = async (term: string, resultsCallback: (options: OptionType[]) => void) => {
    // Vi begrenser antall treff vi viser fordi enkelte grenser kan få VELDIG mange alternativer, spesielt
    // kommunegrenser. Om ikke alternativet dukker opp må man prøve å søke.
    if (term == null || term === "") {
      resultsCallback(options.slice(0, 40));
    } else {
      resultsCallback(
        options.filter((option) => option.label.toLocaleLowerCase().includes(term.toLocaleLowerCase())).slice(0, 40),
      );
    }
  };

  const selectedValue = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  return (
    <SearchContainer>
      <SearchAsync
        optionLabelFormatter={highlightFormatter}
        value={selectedValue}
        placeholder={`Skriv inn navnet eller nummeret til kretsen`}
        dropdownIndicator={<Icon icon="expand_more" weight={400} />}
        defaultOptions={true}
        noOptionsMessage={noOptionMessage}
        loadOptions={loadResults}
        debounceTime={50}
        onChange={(newValue) => onChange(newValue?.value)}
      />
    </SearchContainer>
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

const SearchContainer = styled.div`
  background: var(--kvib-colors-white);
  border-radius: 5px;
`;
