import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import Heading from "components/typography/Heading";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  FeatureCollection,
  StemmekretsRef,
  StemmekretsResponse,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";
import { Section, ContrastSection } from "./components";
import { fetcherWithToken, getIdFromEntity } from "utils/api";
import CreateUtkastModal, {
  CreateUtkastCallbackArgument,
} from "./CreateUtkastModal";
import { useUtkast } from "contexts/UtkastContext";
import UtkastToast from "components/Kart/Toolbar/UtkastToast";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { stemmekretsgrenserFetcher } from "api/stemmekrets";

type Props = {
  stemmekrets: StemmekretsResponse | undefined;
  alleStemmekretser: StemmekretsRef[];
  toggleRow: (id: string) => void;
};

const MergeTab = ({ stemmekrets, alleStemmekretser, toggleRow }: Props) => {
  const { t } = useTranslation();

  const { utkast, updateUtkast } = useUtkast();
  const { setError } = useErrorHandling();
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { setAndSaveSammenslaaingsFeatures } = useToolbar();

  const [isCreateUtkastModalOpen, setIsCreateUtkastModalOpen] = useState(false);
  const [utkastJustCreated, setUtkastJustCreated] = useState(false);

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

  const getOverlappingStemmekretsFeatureIds = (featureIds: string[]) => {
    return featureIds.filter(
      (featureId, index) => featureIds.indexOf(featureId) !== index
    );
  };

  const mergeStemmekrets = (nyttUtkast: CreateUtkastCallbackArgument) => {
    promptUtkastJustCreated();
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
      const sammenslaaingsStemmekretsIder =
        stemmekretsTilSammenslaaingListe.map(
          (stemmekretsRef) => stemmekretsRef.id.lokalid.value
        );
      sammenslaaingsStemmekretsIder.push(stemmekrets.id.lokalid.value);

      const promiseArray = stemmekretsgrenserFetcher(
        sammenslaaingsStemmekretsIder,
        tokenHolderFunc()?.token
      );
      promiseArray.then((resolvedValue) => {
        const stemmekretsFeatureIds: string[] = resolvedValue
          ? resolvedValue.filter((x) => x !== undefined).map((x) => String(x))
          : [];
        const overlappingFeatureIds = getOverlappingStemmekretsFeatureIds(
          stemmekretsFeatureIds
        );

        setAndSaveSammenslaaingsFeatures(
          stemmekretsFeatureIds,
          overlappingFeatureIds
        );
      });
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

  const promptUtkastJustCreated = () => {
    console.log("prompting it to be just created!!!");
    setUtkastJustCreated(true);

    const timeId = setTimeout(() => {
      setUtkastJustCreated(false);
    }, 5000);

    return () => {
      clearTimeout(timeId);
    };
  };

  return (
    <>
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
        <StemmekretsSelect
          onChange={(e) =>
            setStemmekretsNummerTilSammenslaaing(e.currentTarget.value)
          }
          defaultValue={"default"}
          label={t("stemmekrets.Navn- eller nummer på stemmekrets")}
        >
          <option value={"default"} disabled>
            {t("Velg stemmekretsen du vil slå sammen med")}
          </option>
          {alleStemmekretser.map((s) => (
            <option key={s.nummer} value={s.nummer}>{`${s.nummer} - ${
              s.navn.charAt(0).toUpperCase() + s.navn.toLowerCase().slice(1)
            }`}</option>
          ))}
        </StemmekretsSelect>
      </Section>
      <ContrastSection>
        <SectionHeading>
          {t("stemmekrets.Detaljer om den sammenslåtte kretsen")}
        </SectionHeading>
        <br />
        <InputsWrapper>
          <Input
            label={t("stemmekrets.Stemmekretsnavn")}
            value={stemmekretsnavn}
            onChange={(e) => setStemmekretsnavn(e.currentTarget.value)}
          />
          <Input
            label={t("stemmekrets.Stemmekretsnummer")}
            value={stemmekretsnummer}
            onChange={(e) => setStemmekretsnummer(e.currentTarget.value)}
          />
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
      {utkastJustCreated && (
        <UtkastToast
          text={
            "Utkastet er opprettet og sammenslåingen av Flosta og Myrdal er lagret"
          }
        />
      )}
    </>
  );
};

const StemmekretsSelect = styled(Select)`
  max-width: 400px;
  margin-top: 20px;

  select {
    margin: 0;
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
