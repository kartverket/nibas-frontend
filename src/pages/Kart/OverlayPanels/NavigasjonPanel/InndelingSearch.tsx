import { Badge, SearchAsync, SearchAsyncElement, Text } from "@kvib/react";
import { FormatOptionLabelMeta } from "chakra-react-select";
import { ReactNode, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { InndelingSearchResponse, InndelingSearchType } from "types/api";
import { useInndelingerSearch } from "./useInndelingerSearch";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

export type InndelingOption = InndelingSearchResponse & {
  label: string;
};

type InndelingSearchProps = {
  onSelect: (selectedSearchResult: InndelingOption | null) => void;
  isOpen: boolean;
  inndelingstypeFilter: InndelingSearchType[];
};

export const InndelingSearch = ({ onSelect, isOpen, inndelingstypeFilter }: InndelingSearchProps) => {
  const searchInndelinger = useInndelingerSearch();
  const searchRef = useRef<SearchAsyncElement<InndelingOption>>(null);
  const { gyldighetsdato } = useValgtGyldighetsdato();

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
    onSelect(inndeling);
  };

  const loadResults = async (term: string, resultsCallback: (options: InndelingOption[]) => void) => {
    if (term.length > 1) {
      const inndelinger = await searchInndelinger(term, 15, gyldighetsdato);
      if (inndelinger !== null) {
        resultsCallback(
          // TODO filter her gjør at resultater potensielt dukker opp senere enn nødvendig fordi de er statisk sortert.
          // Hvis vi endrer endepunkt til å ha filter kan vi få det korrekt
          inndelinger.map(mapInndelingResponseToOption).filter((option) => inndelingstypeFilter.includes(option.type)),
        );
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
        {inndelingstypeFilter.length > 1 && <Badge colorScheme="gray">{type}</Badge>}
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

    if (!matches) {
      return <FormattedOption label={inndeling.label} type={inndeling.type} />;
    }

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

  // TODO: Dette burde ikke være en useEffect. Dette burde helles trigges samtidig som `isOpen` settes til true så man slipper ekstra rerender her
  useEffect(() => {
    const searchElement = searchRef.current;
    if (isOpen && searchElement != null) {
      searchElement.focus();

      searchElement.onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const inputRef = searchElement.inputRef;
        if (inputRef != null && event.code === "Escape") {
          if (inputRef.value.length === 0) {
            searchElement.blur();
          } else {
            inputRef.value = "";
            searchElement.onMenuClose();
            searchElement.clearValue();
          }
        }
      };
    }
  }, [isOpen]);

  return (
    <SearchAsync
      optionLabelFormatter={highlightAndBadgeLabelFormatter}
      placeholder="Skriv inn navnet eller nummeret til inndelingen"
      noOptionsMessage={noOptionMessage}
      onChange={handleOnChange}
      loadOptions={loadResults}
      debounceTime={150}
      autoFocus
      ref={searchRef}
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
