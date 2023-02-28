import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import Heading from "components/typography/Heading";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  StemmekretsRef,
  StemmekretsResponse,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";
import { BlockLabel } from "../metadataComponents";
import { Section, ContrastSection, InputsWrapper } from "./components";
import { getIdFromEntity } from "utils/api";
import { useToolbarSaving } from "contexts/ToolbarContext";

import CreateUtkastModal from "./CreateUtkastModal";

type Props = {
  stemmekrets: StemmekretsResponse | undefined;
  alleStemmekretser: StemmekretsRef[];
  toggleRow: (id: string) => void;
};

const MergeTab = ({ stemmekrets, alleStemmekretser, toggleRow }: Props) => {
  const { t } = useTranslation();
  const { addEntry } = useToolbarSaving();
  const [isCreateUtkastModalOpen, setIsCreateUtkastModalOpen] = useState(false);
  const [stemmekretsnavn, setStemmekretsnavn] = useState(
    stemmekrets ? stemmekrets.stemmekretsnavn : ""
  );

  const [stemmekretsnummer, setStemmekretsnummer] = useState(
    stemmekrets ? stemmekrets.stemmekretsnummer : ""
  );

  const [
    stemmekretsNummerTilSammenslaaing,
    setStemmekretsNummerTilSammenslaaing,
  ] = useState("");

  const stemmekretsId = stemmekrets ? getIdFromEntity(stemmekrets) : "";
  const [stemmekretsIdTilSammenslaaing, setStemmekretsIdTilSammenslaaing] =
    useState("");
  // let fullStemmekretsTilSammenslaaing: StemmekretsResponse? = null;

  const fromFormToRequest = (
    stemmekretsRespons: StemmekretsResponse,
    sammenslaaingsStemmekrets: StemmekretsRef
  ): StemmekretsSammenslaaingsendringRequest => ({
    viderefoertStemmekrets: {
      lokalId: stemmekretsRespons.id.lokalid.value,
      version: stemmekretsRespons.version,
    },
    stemmekretserTilSammenslaaing: [
      {
        lokalId: sammenslaaingsStemmekrets.id.lokalid.value,
        version: sammenslaaingsStemmekrets.version,
      },
    ],
    stemmekretsNavn: stemmekretsnavn,
    stemmekretsNummer: stemmekretsnummer,
  });

  const getStemmekretsByNummer = (nummer: string): StemmekretsRef[] => {
    return alleStemmekretser.filter((krets) => krets.nummer === nummer);
  };

  const mergeStemmekrets = () => {
    console.log("merging");
    console.log(
      "stemmekrets til sammenslaaing:",
      stemmekretsNummerTilSammenslaaing
    );
    const stemmekretsTilSammenslaaingListe = getStemmekretsByNummer(
      stemmekretsNummerTilSammenslaaing
    );
    setStemmekretsIdTilSammenslaaing(
      stemmekretsTilSammenslaaingListe[0].id.lokalid.value
    );

    console.log(
      "stemmekrets",
      getStemmekretsByNummer(stemmekretsNummerTilSammenslaaing)
    );
    if (stemmekretsTilSammenslaaingListe.length === 1 && stemmekrets) {
      addEntry({
        type: "stemmekretssammenslaaingsendring",
        changes: [
          {
            from: fromFormToRequest(
              stemmekrets,
              stemmekretsTilSammenslaaingListe[0]
            ),
            to: fromFormToRequest(
              stemmekrets,
              stemmekretsTilSammenslaaingListe[0]
            ),
            id: stemmekretsId,
          },
        ],
      });
    }
  };

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
          <Select
            onChange={(e) =>
              setStemmekretsNummerTilSammenslaaing(e.currentTarget.value)
            }
          >
            <option value="" disabled selected>
              {"Velg stemmekretsen du vil slå sammen med"}
            </option>
            {alleStemmekretser.map((s) => (
              <option key={s.nummer} value={s.nummer}>{`${s.nummer} - ${
                s.navn.charAt(0).toUpperCase() + s.navn.toLowerCase().slice(1)
              }`}</option>
            ))}
          </Select>
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
          <Button onClick={() => toggleRow(stemmekretsId)} variant="tertiary">
            {t("action.Avbryt")}
          </Button>
          <Button onClick={() => setIsCreateUtkastModalOpen(true)}>
            {t("stemmekrets.Slå sammen")}
          </Button>
        </Buttons>
      </Section>
      <CreateUtkastModal
        isCreateUtkastModalOpen={isCreateUtkastModalOpen}
        setIsCreateUtkastModalOpen={setIsCreateUtkastModalOpen}
        callback={mergeStemmekrets}
      />
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
