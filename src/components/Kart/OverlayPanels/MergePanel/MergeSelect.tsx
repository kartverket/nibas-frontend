import { InputHTMLAttributes, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { StemmekretsResponse } from "types/api";
import Icon from "components/Icon";
import Button from "components/form/Button";
import Select from "components/form/Select";
import { ErrorMessage, ValidationError } from "components/form/Input/Input";

const MergeSelectWrapper = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "select fjern"
    "error .";
`;

const MergeSelectErrorMessage = styled(ErrorMessage)`
  grid-area: error;
`;

const RemoveButton = styled(Button).attrs(() => ({ variant: "tertiary" }))`
  grid-area: fjern;
  margin-top: 26px;
  margin-left: 16px;
  background: transparent;

  :hover {
    background: transparent;
  }
`;

const MergeSelectStyle = styled(Select)`
  grid-area: select;
`;

type MergeSelectProps = {
  onRemove: () => unknown;
  showRemoveButton: boolean;
  stemmekretser: StemmekretsResponse[];
  validationError?: ValidationError;
} & InputHTMLAttributes<HTMLSelectElement>;

export const MergeSelect = forwardRef<HTMLDivElement, MergeSelectProps>(
  (
    {
      onRemove,
      stemmekretser,
      showRemoveButton,
      validationError,
      ...inputProps
    },
    ref
  ) => {
    const { t } = useTranslation();
    return (
      <MergeSelectWrapper ref={ref}>
        <MergeSelectStyle
          {...inputProps}
          defaultValue="default"
          label={t("stemmekrets.sammenslaaing.label")}
        >
          <option value={"default"} disabled>
            {t("stemmekrets.sammenslaaing.actions.velg")}
          </option>
          {stemmekretser.map((s) => (
            <option key={s.stemmekretsnummer} value={s.stemmekretsnummer}>
              {`${s.stemmekretsnummer} - ${s.stemmekretsnavn}`}
            </option>
          ))}
        </MergeSelectStyle>
        {showRemoveButton && (
          <RemoveButton onClick={onRemove}>Fjern</RemoveButton>
        )}
        {validationError?.showError && (
          <MergeSelectErrorMessage>
            <Icon icon="warning_amber" />
            {validationError.message}
          </MergeSelectErrorMessage>
        )}
      </MergeSelectWrapper>
    );
  }
);

MergeSelect.displayName = "MergeSelect";
