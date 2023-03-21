import { StemmekretsRef } from "../../../../types/api";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Button from "../../../form/Button";
import Select from "../../../form/Select";
import { removeFromList, replaceInList } from "utils/list-utils";
import Icon from "../../../Icon/Icon";

type SammenslaaingMultiselectProps = {
  stemmekretsnavn: string;
  alleStemmekretser: StemmekretsRef[];
  onChange: (stemmekretser: string[]) => unknown;
  value: string[];
};

export const SammenslaaingMultiselect = ({
  stemmekretsnavn,
  onChange,
  value,
  alleStemmekretser,
}: SammenslaaingMultiselectProps) => {
  const { t } = useTranslation();

  const removeStemmekretsTilSammenslaaing = (index: number) => {
    onChange(removeFromList(index, value));
  };

  const updateStemmekretsTilSammenslaaing = (
    index: number,
    newValue: string
  ) => {
    onChange(replaceInList(index, newValue, value));
  };

  return (
    <section>
      <p>
        {t("stemmekrets.sammenslaaing.undertittel")}{" "}
        <Stemmekretsnavn>{stemmekretsnavn}</Stemmekretsnavn>?
      </p>
      <MultiSelectWrapper>
        {value.map((nummer, index) => (
          <StemmekretsSelect
            key={`${index} ${nummer}`}
            value={nummer}
            onChange={(newValue) =>
              updateStemmekretsTilSammenslaaing(index, newValue)
            }
            onRemove={() => removeStemmekretsTilSammenslaaing(index)}
            stemmekretser={alleStemmekretser}
            showRemoveButton={index < value.length - 1}
          />
        ))}
        <LeggTilFlerButton onClick={() => onChange([...value, ""])}>
          {t("stemmekrets.sammenslaaing.actions.legg-til-flere")}
        </LeggTilFlerButton>
      </MultiSelectWrapper>
    </section>
  );
};

type StemmekretsSelectProps = {
  onChange: (value: string) => unknown;
  onRemove: () => unknown;
  value: string | null;
  showRemoveButton: boolean;
  stemmekretser: StemmekretsRef[];
};

export const StemmekretsSelect = ({
  onChange,
  onRemove,
  value,
  stemmekretser,
  showRemoveButton,
}: StemmekretsSelectProps) => {
  const { t } = useTranslation();
  const selectedValue = value == null || value === "" ? "default" : value;

  return (
    <StemmekretsSelectWrapper>
      <StemmekretsSelectStyle
        onChange={(e) => onChange(e.currentTarget.value)}
        value={selectedValue}
        label={t("stemmekrets.sammenslaaing.label")}
      >
        <option value={"default"} disabled>
          {t("stemmekrets.sammenslaaing.actions.velg")}
        </option>
        {stemmekretser.map((s) => (
          <option key={s.nummer} value={s.nummer}>
            {`${s.nummer} - ${s.navn}`}
          </option>
        ))}
      </StemmekretsSelectStyle>
      {showRemoveButton && (
        <RemoveButton onClick={onRemove}>Fjern</RemoveButton>
      )}
    </StemmekretsSelectWrapper>
  );
};

const StemmekretsSelectWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const Stemmekretsnavn = styled.span`
  font-weight: 900;
`;

const RemoveButton = styled(Button).attrs(() => ({ variant: "tertiary" }))`
  margin-top: 26px;
  background: transparent;

  :hover {
    background: transparent;
  }
`;

const MultiSelectWrapper = styled.div`
  margin-top: 40px;
`;

const LeggTilFlerButton = styled(Button).attrs(() => ({
  icon: <Icon icon="add" />,
  variant: "secondary",
}))`
  margin-top: 20px;
  background: transparent;

  :hover {
    background: transparent;
  }
`;

const StemmekretsSelectStyle = styled(Select)`
  max-width: 400px;
`;
