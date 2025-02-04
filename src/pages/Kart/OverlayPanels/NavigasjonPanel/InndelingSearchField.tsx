import { Badge, FormControl, FormErrorMessage, FormLabel, SearchAsync, Text } from "@kvib/react";
import { FormatOptionLabelMeta } from "chakra-react-select";
import { ValidationError } from "components/Input";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { ReactNode } from "react";
import { Control, Controller, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { styled } from "styled-components";
import { InndelingSearchResponse, InndelingSearchType } from "types/api";
import { useInndelingerSearch } from "./useInndelingerSearch";

export type InndelingOption = InndelingSearchResponse & {
  label: string;
};

type InndelingSearchFieldProps<T extends FieldValues> = {
  label?: string;
  fieldName: Path<T>;
  control?: Control<T>;
  rules?: RegisterOptions;
  inndelingstypeFilter: InndelingSearchType[];
  validationError?: ValidationError;
  onSelectInndeling?: (inndeling: InndelingOption | null) => void;
};

export const InndelingSearchField = <T extends FieldValues>({
  label: fieldLabel,
  fieldName,
  control,
  rules,
  inndelingstypeFilter,
  validationError,
  onSelectInndeling,
}: InndelingSearchFieldProps<T>) => {
  const searchInndelinger = useInndelingerSearch();
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

  return (
    <FormControl isInvalid={validationError?.showError}>
      {fieldLabel != null && <FormLabel>{fieldLabel}</FormLabel>}
      <Controller
        name={fieldName}
        control={control}
        rules={rules}
        render={({ field: { onChange, value, ref } }) => {
          const onChangeWithClearErrors = (newValue: InndelingOption | null) => {
            onChange(newValue);
            if (onSelectInndeling != null) {
              onSelectInndeling(newValue);
            }
          };
          return (
            <SearchAsync
              value={value}
              optionLabelFormatter={highlightAndBadgeLabelFormatter}
              placeholder="Skriv inn navnet eller nummeret til inndelingen"
              noOptionsMessage={noOptionMessage}
              onChange={onChangeWithClearErrors}
              loadOptions={loadResults}
              debounceTime={150}
              autoFocus
              ref={ref}
            />
          );
        }}
      />
      <FormErrorMessage>{validationError?.message}</FormErrorMessage>
    </FormControl>
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
