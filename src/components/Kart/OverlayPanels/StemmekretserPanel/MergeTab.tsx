import Button from "components/form/Button";
import Input from "components/form/Input";
import Heading from "components/typography/Heading";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  StemmekretsRef,
  StemmekretsResponse,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";
import { Section, ContrastSection } from "./components";
import { getIdFromEntity } from "utils/api";
import CreateUtkastModal, {
  CreateUtkastCallbackArgument,
} from "./CreateUtkastModal";
import { useUtkast } from "contexts/UtkastContext";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { removeNull } from "utils/list-utils";
import { SammenslaaingMultiselect } from "./SammenslaaingMultiselect";

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
  ] = useState([""]);

  const stemmekretsId = stemmekrets ? getIdFromEntity(stemmekrets) : "";

  const fromFormToRequest = (
    stemmekretsRespons: StemmekretsResponse,
    sammenslaaingsStemmekretser: StemmekretsRef[]
  ): StemmekretsSammenslaaingsendringRequest => ({
    viderefoertStemmekrets: {
      lokalId: stemmekretsRespons.id.lokalid.value,
      version: stemmekretsRespons.version,
    },
    stemmekretserTilSammenslaaing: sammenslaaingsStemmekretser.map(
      (sammenslaaingsStemmekrets) => ({
        lokalId: sammenslaaingsStemmekrets.id.lokalid.value,
        version: sammenslaaingsStemmekrets.version,
      })
    ),
    stemmekretsNavn: stemmekretsnavn,
    stemmekretsNummer: stemmekretsnummer,
  });

  const getStemmekretsByNummer = (nummer: string): StemmekretsRef | null => {
    return alleStemmekretser.find((krets) => krets.nummer === nummer) ?? null;
  };

  const mergeStemmekrets = (nyttUtkast: CreateUtkastCallbackArgument) => {
    const stemmekretsTilSammenslaaingListe = removeNull(
      stemmekretsNummerTilSammenslaaing.map((s) => getStemmekretsByNummer(s))
    );

    if (stemmekretsTilSammenslaaingListe.length > 0 && stemmekrets) {
      const updateUtkastRequest = {
        version: 1,
        navn: nyttUtkast.navn,
        endringstype: nyttUtkast.endringstype,
        operasjoner: {
          ...nyttUtkast.operasjoner,
          stemmekretsSammenslaaingsendring: fromFormToRequest(
            stemmekrets,
            stemmekretsTilSammenslaaingListe
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
        <SectionHeading>{t("stemmekrets.sammenslaaing.tittel")}</SectionHeading>
        <SammenslaaingMultiselect
          stemmekretsnavn={stemmekrets?.stemmekretsnavn ?? ""}
          onChange={(value) => setStemmekretsNummerTilSammenslaaing(value)}
          value={stemmekretsNummerTilSammenslaaing}
          alleStemmekretser={alleStemmekretser}
        />
      </Section>
      <ContrastSection>
        <SectionHeading>
          {t("stemmekrets.sammenslaaing.detaljer-tittel")}
        </SectionHeading>
        <br />
        <InputsWrapper>
          <Input
            label={t(
              "stemmekrets.sammenslaaing.detaljer-label-stemmekretsnummer"
            )}
            value={stemmekretsnummer}
            onChange={(e) => setStemmekretsnummer(e.currentTarget.value)}
          />
          <Input
            label={t(
              "stemmekrets.sammenslaaing.detaljer-label-stemmekretsnavn"
            )}
            value={stemmekretsnavn}
            onChange={(e) => setStemmekretsnavn(e.currentTarget.value)}
          />
        </InputsWrapper>
      </ContrastSection>
      <Section>
        <Buttons>
          <Button onClick={() => toggleRow(stemmekretsId)} variant="tertiary">
            {t("stemmekrets.sammenslaaing.actions.avbryt")}
          </Button>
          <Button onClick={() => openCreateUtkastModal()}>
            {t("stemmekrets.sammenslaaing.actions.slaa-sammen")}
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

const SectionHeading = styled(Heading).attrs({ tag: "h3", size: "xs" })`
  margin: 0;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
`;

const InputsWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: 80%;

  > * {
    width: 100%;

    &:first-child {
      flex: 1;
    }

    &:last-child {
      flex: 3;
    }
  }
`;

export default MergeTab;
