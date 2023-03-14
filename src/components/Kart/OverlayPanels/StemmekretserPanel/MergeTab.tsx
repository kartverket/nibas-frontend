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

import CreateUtkastModal, {
  CreateUtkastCallbackArgument,
} from "./CreateUtkastModal";
import { useUtkast } from "contexts/UtkastContext";
import { useErrorHandling } from "contexts/ErrorHandlingContext";

type Props = {
  stemmekrets: StemmekretsResponse | undefined;
  alleStemmekretser: StemmekretsRef[];
  toggleRow: (id: string) => void;
};

const MergeTab = ({ stemmekrets, alleStemmekretser, toggleRow }: Props) => {
  const { t } = useTranslation();
  const { utkast, updateUtkast } = useUtkast();
  const { setError } = useErrorHandling();

  const [isCreateUtkastModalOpen, setIsCreateUtkastModalOpen] = useState(false);

  const [stemmekretsnavn, setStemmekretsnavn] = useState(
    stemmekrets?.stemmekretsnavn ?? ""
  );
  const [stemmekretsnummer, setStemmekretsnummer] = useState(
    stemmekrets?.stemmekretsnummer ?? ""
  );

  const [
    stemmekretsNummerTilSammenslaaing,
    setStemmekretsNummerTilSammenslaaing,
  ] = useState("");

  const stemmekretsId = stemmekrets ? getIdFromEntity(stemmekrets) : "";

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

  const mergeStemmekrets = (nyttUtkast: CreateUtkastCallbackArgument) => {
    const stemmekretsTilSammenslaaingListe = getStemmekretsByNummer(
      stemmekretsNummerTilSammenslaaing
    );

    if (stemmekretsTilSammenslaaingListe.length === 1 && stemmekrets) {
      const updateUtkastRequest = {
        version: 1,
        navn: nyttUtkast.navn,
        endringstype: nyttUtkast.endringstype,
        operasjoner: {
          ...nyttUtkast.operasjoner,
          stemmekretsSammenslaaingsendring: fromFormToRequest(
            stemmekrets,
            stemmekretsTilSammenslaaingListe[0]
          ),
        },
      };
      updateUtkast(nyttUtkast.id, updateUtkastRequest);
    }
  };

  const openCreateUtkastModal = () => {
    if (utkast) {
      setError({
        title: t("stemmekrets.utkast-sammenslaaing-alert.tittel"),
        body: t("stemmekrets.utkast-sammenslaaing-alert.tekst"),
      });
      return;
    }
    isCreateUtkastModalOpen
      ? setIsCreateUtkastModalOpen(false)
      : setIsCreateUtkastModalOpen(true);
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
            defaultValue={"default"}
          >
            <option value={"default"} disabled>
              {t("Velg stemmekretsen du vil slå sammen med")}
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
          <Button onClick={() => openCreateUtkastModal()}>
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
