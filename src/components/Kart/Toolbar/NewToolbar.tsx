import styled from "styled-components";
import ModeButton from "./ModeButton";
import { map } from "../constants";
import { useTranslation } from "react-i18next";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";
import { useToolbar, useToolbarActions } from "contexts/ToolbarContext";
import { useState } from "react";
import Heading from "components/typography/Heading";
import Input from "components/form/Input";
import Select from "components/form/Select";
import Button from "components/form/Button";
import Label from "components/form/Label";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import { Translation } from "i18n";
import { useSearchParams } from "react-router-dom";
import { createUtkast as createApiUtkast } from "api/utkast";
import UtkastCreatedTab from "./UtkastCreatedTab";
import Feedback from "components/Feedback/Feedback";
import useFeedback from "hooks/useFeedback";
import { useUtkast } from "contexts/UtkastContext";

const spacing = 20;
const borderWidth = 2;

const Container = styled.div`
  position: absolute;
  top: ${spacing}px;
  right: ${spacing}px;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${spacing}px;

  pointer-events: none;
  & > * {
    pointer-events: all;
  }
`;

const Frame = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing}px;

  width: fit-content;
  padding: 20px 12px;
  border: ${borderWidth}px solid var(--gray_light);
  background: white;
  border-radius: 10px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.15);
`;

// TODO: trekk utkastframe ut til egen komponent
const UtkastFrame = styled(Frame)`
  position: absolute;
  right: 100%;
  margin-right: ${spacing}px;
  width: 300px; // TODO: fix

  ${Heading} {
    margin: 0;
  }

  &::before {
    position: absolute;
    top: ${spacing * 1.5}px;
    left: 100%;

    content: "";
    display: block;
    background: var(--gray_light);
    width: ${spacing * 0.75}px;
    height: ${spacing * 1.5}px;

    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }

  &::after {
    position: absolute;
    top: calc(${spacing * 1.5}px + ${borderWidth}px);
    left: calc(100% - ${borderWidth / 2}px);

    content: "";
    display: block;
    background: white;
    width: calc(${spacing * 0.75}px - ${borderWidth}px);
    height: calc(${spacing * 1.5}px - ${borderWidth * 2}px);

    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }
`;

const LagreFrame = styled(Frame)`
  flex-direction: row;
  justify-content: center;
  width: 100%;
`;

const UtkastInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  color: var(--gray);
  font-size: 12px;
`;

const UtkastNavn = styled.h4`
  margin: 0;
  color: var(--black);
  font-size: 14px;
  font-weight: normal;
`;

const BlockLabel = styled(Label)`
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--gray_dark);
`;

const Buttons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
`;

const Divider = styled.hr`
  width: 100%;
  border: 1px solid var(--gray_light);
`;

const DividerVertical = styled(Divider)`
  width: 1px;
  height: 50px;
  margin: 0 4px;
`;

// TODO: endre navn på komponenten
// TODO: maksgrense og minimumsgrense på zoom
// TODO: ta en runde på translations, har sikkert glemt noe
const NewToolbar = () => {
  const [createUtkastOpen, setCreateUtkastOpen] = useState(false);
  const [utkastJustCreated, setUtkastJustCreated] = useState(false);
  const { t } = useTranslation();

  const { redigeringsmodusAktiv } = useRedigeringsmodus();
  const { canSave, undo, redo } = useToolbarActions();

  const { utkast, updateUtkastWithHistory, closeUtkast } = useUtkast();
  const { openFeedback, isOpen, closeFeedback, feedbackContent } = useFeedback(
    t(
      "Utkastet ditt har endringer som ikke er lagret. Dersom du lukker utkastet nå, vil disse endringene forkastes. Er du sikker på at du vil fortsette?"
    )
  );
  // TODO: flytt til egen utkast-komponent
  const [utkastName, setUtkastName] = useState("");
  const [utkastType, setUtkastType] = useState("");
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { history, clearHistory } = useToolbar();
  const setSearchParams = useSearchParams()[1];

  const promptUtkast = () => {
    setUtkastJustCreated(true);
    console.log("promptUtkast");

    const timeId = setTimeout(() => {
      setUtkastJustCreated(false);
      console.log("promptUtkast expired");
    }, 5000);

    return () => {
      clearTimeout(timeId);
    };
  };

  const createUtkast = async () => {
    const response = await createApiUtkast(
      {
        navn: utkastName,
        endringstype: utkastType,
        operasjoner: historyToUtkastOperations(history),
      },
      tokenHolderFunc()?.token
    );

    if (response.status !== 201) throw new Error("Status ikke riktig");

    const json = await response.json();
    const utkastId = json.id;

    setCreateUtkastOpen(false);
    setSearchParams({ utkast: utkastId });
    clearHistory();
    promptUtkast();
  };

  // TODO: avklar om state skal overlappe eller ikke. Altså om man kan ha både fjern og legge til samtidig, hva med snap og flytt også?

  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
  };

  return (
    <Container>
      {redigeringsmodusAktiv && (
        <>
          {createUtkastOpen && (
            <>
              <UtkastFrame>
                <Heading size="xs" tag="h3">
                  Opprett et nytt utkast
                </Heading>
                <BlockLabel>
                  {t("utkast.Navn på utkast")}
                  <Input
                    placeholder="f.eks. Endring av stemmekrets i Froland"
                    value={utkastName}
                    onChange={(e) => setUtkastName(e.target.value)}
                  />
                </BlockLabel>
                <BlockLabel>
                  {t("utkast.Endringstype")}
                  <Select
                    value={utkastType}
                    onChange={(e) => setUtkastType(e.target.value)}
                  >
                    <option value="" disabled>
                      {t("utkast.Velg en endringstype fra listen")}
                    </option>
                    {Object.keys(translateKeysByEndringsType).map((type) => (
                      <option key={type} value={type}>
                        {t(translateKeysByEndringsType[type] as Translation)}
                      </option>
                    ))}
                  </Select>
                </BlockLabel>
                <Buttons>
                  <Button
                    onClick={() => setCreateUtkastOpen(false)}
                    variant="tertiary"
                  >
                    {t("action.Avbryt")}
                  </Button>
                  <Button
                    onClick={createUtkast}
                    disabled={utkastType === "" || utkastName === ""}
                  >
                    {t("action.Opprett")}
                  </Button>
                </Buttons>
              </UtkastFrame>
            </>
          )}
          {utkastJustCreated && <UtkastCreatedTab />}
          <LagreFrame>
            {utkast ? (
              <>
                <UtkastInfo>
                  <span>{t("utkast.Navn på utkast")}</span>
                  <UtkastNavn>{utkast.navn}</UtkastNavn>
                </UtkastInfo>
                <DividerVertical />

                <ModeButton
                  icon="save"
                  ariaLabel="Lagre utkast"
                  onClick={updateUtkastWithHistory}
                  disabled={!canSave}
                >
                  {t("action.Lagre")}
                </ModeButton>

                <ModeButton
                  icon="close"
                  ariaLabel="Lukk utkast"
                  onClick={canSave ? openFeedback : closeUtkast}
                >
                  {t("action.Lukk")}
                </ModeButton>
              </>
            ) : (
              <ModeButton
                icon="save"
                ariaLabel="Lagre utkast"
                onClick={() => setCreateUtkastOpen(!createUtkastOpen)}
                disabled={!canSave}
                isActive={createUtkastOpen}
              >
                {t("action.Lagre")}
              </ModeButton>
            )}

            <Feedback
              type="warning"
              title="Advarsel"
              isOpen={isOpen}
              onClose={closeFeedback}
              onContinue={closeUtkast}
              closeText={t("Fortsett redigering")}
              continueText={t("Forkast endringer")}
            >
              {feedbackContent}
            </Feedback>
          </LagreFrame>
        </>
      )}
      <Frame>
        <ModeButton
          icon="undo"
          ariaLabel="Angre handling"
          onClick={undo}
          disabled={!undo}
        >
          {t("action.Undo")}
        </ModeButton>
        <ModeButton
          icon="redo"
          ariaLabel="Gjør om handling"
          onClick={redo}
          disabled={!redo}
        >
          {t("action.Redo")}
        </ModeButton>
        <Divider />
        <ModeButton icon="map" ariaLabel="Flytt punkter">
          Flytt
        </ModeButton>
        <ModeButton icon="map" ariaLabel="Legg til punkter">
          Legg til
        </ModeButton>
        <ModeButton icon="map" ariaLabel="Fjern punkter">
          Fjern
        </ModeButton>
        <ModeButton icon="map" ariaLabel="Snap til bakgrunnskart">
          Snap
        </ModeButton>
        <Divider />
        <ModeButton
          icon="zoom_in"
          onClick={() => zoom(1)}
          ariaLabel="Zoom inn på kartet"
        >
          Zoom inn
        </ModeButton>
        <ModeButton
          icon="zoom_out"
          onClick={() => zoom(-1)}
          ariaLabel="Zoom ut på kartet"
        >
          Zoom ut
        </ModeButton>
      </Frame>
    </Container>
  );
};

export default NewToolbar;
