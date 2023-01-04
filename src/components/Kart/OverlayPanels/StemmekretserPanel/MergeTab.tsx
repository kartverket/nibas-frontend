import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import Heading from "components/typography/Heading";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { StemmekretsResponse } from "types/api";
import { BlockLabel, ContrastSection, InputsWrapper, Section } from "./EditRow";

type Props = {
  stemmekrets: StemmekretsResponse | undefined;
  alleStemmekretser: {
    stemmekretsnummer: string;
    stemmekretsnavn: string;
  }[];
};

const MergeTab = ({ stemmekrets, alleStemmekretser }: Props) => {
  const { t } = useTranslation();
  const [stemmekretsnavn, setStemmekretsnavn] = useState(
    stemmekrets?.stemmekretsnavn
  );
  const [stemmekretsnummer, setStemmekretsnummer] = useState(
    stemmekrets?.stemmekretsnummer
  );

  return (
    <div>
      <Section>
        <SectionHeading>
          {t("stemmekrets.Slå sammen stemmekretser")}
        </SectionHeading>
        <p>
          {t("stemmekrets.Hvilken stemmekrets ønsker du å slå sammen med")}{" "}
          <Stemmekretsnavn>
            {stemmekrets?.stemmekretsnavn.toLowerCase()}
          </Stemmekretsnavn>
          ?
        </p>
        <Dropdown>
          <label>{t("stemmekrets.Navn- eller nummer på stemmekrets")}</label>
          <Select>
            {alleStemmekretser.map((s) => (
              <option key={s.stemmekretsnummer} value={s.stemmekretsnummer}>{`${
                s.stemmekretsnummer
              } - ${s.stemmekretsnavn.toLowerCase()}`}</option>
            ))}
          </Select>
          <span>
            {t("stemmekrets.Du kan søke etter både navn og nummer på kretsen")}
          </span>
        </Dropdown>
      </Section>
      <ContrastSection>
        <SectionHeading>
          {t("stemmekrets.Detaljer om den sammenslåtte kretsen")}
        </SectionHeading>
        <br />
        <InputsWrapper>
          <BlockLabel>
            {t("stemmekrets.Stemmekretsnavn")}
            <Input
              value={stemmekretsnavn}
              onChange={(e) => setStemmekretsnavn(e.currentTarget.value)}
            />
          </BlockLabel>
          <BlockLabel>
            {t("stemmekrets.Stemmekretsnummer")}
            <Input
              value={stemmekretsnummer}
              onChange={(e) => setStemmekretsnummer(e.currentTarget.value)}
            />
          </BlockLabel>
        </InputsWrapper>
      </ContrastSection>
      <Section>
        <Buttons>
          <Button variant="tertiary">{t("action.Avbryt")}</Button>
          <Button>{t("stemmekrets.Slå sammen")}</Button>
        </Buttons>
      </Section>
    </div>
  );
};

const Dropdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: 400px;
  margin-top: 20px;

  select {
    margin: 0;
    text-transform: capitalize;
  }

  & > span {
    font-size: 12px;
  }
`;

const SectionHeading = styled(Heading).attrs({ tag: "h3", size: "xs" })`
  margin: 0;
`;

const Stemmekretsnavn = styled.b`
  text-transform: capitalize;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
`;

export default MergeTab;
