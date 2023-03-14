import { useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { Translation } from "i18n";
import { useTranslation } from "react-i18next";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useToolbar } from "contexts/ToolbarContext";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import { createUtkast as createApiUtkast } from "api/utkast";
import Input from "components/form/Input";
import Label from "components/form/Label";
import Select from "components/form/Select";
import Button from "components/form/Button";
import Heading from "components/typography/Heading";
import { Frame, toolbarBorderWidth, toolbarSpacing } from "./components";
import { useErrorHandling } from "contexts/ErrorHandlingContext";

const UtkastFrame = styled(Frame)`
  position: absolute;
  right: 100%;
  margin-right: ${toolbarSpacing}px;
  width: 365px;

  ${Heading} {
    margin: 0;
  }

  &::before {
    position: absolute;
    top: ${toolbarSpacing * 1.5}px;
    left: 100%;

    content: "";
    display: block;
    background: var(--gray_light);
    width: ${toolbarSpacing * 0.75}px;
    height: ${toolbarSpacing * 1.5}px;

    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }

  &::after {
    position: absolute;
    top: calc(${toolbarSpacing * 1.5}px + ${toolbarBorderWidth}px);
    left: calc(100% - ${toolbarBorderWidth / 2}px);

    content: "";
    display: block;
    background: white;
    width: calc(${toolbarSpacing * 0.75}px - ${toolbarBorderWidth}px);
    height: calc(${toolbarSpacing * 1.5}px - ${toolbarBorderWidth * 2}px);

    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }
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

type Props = {
  setUtkastJustCreated: (utkastJustCreated: boolean) => void;
  setCreateUtkastOpen: (createUtkastOpen: boolean) => void;
};

const UtkastToolbar = ({
  setUtkastJustCreated,
  setCreateUtkastOpen,
}: Props) => {
  const { t } = useTranslation();
  const [utkastName, setUtkastName] = useState("");
  const [utkastType, setUtkastType] = useState("");
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { history, clearHistory } = useToolbar();
  const setSearchParams = useSearchParams()[1];
  const { setError } = useErrorHandling();

  const promptUtkast = () => {
    setUtkastJustCreated(true);

    const timeId = setTimeout(() => {
      setUtkastJustCreated(false);
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

    if (response.status > 200 && response.status < 300) {
      const json = await response.json();
      const utkastId = json.id;

      setCreateUtkastOpen(false);
      setSearchParams({ utkast: utkastId });
      clearHistory({ hasPreviouslySavedHistory: true });
      promptUtkast();
    }
    if (response.status >= 400) {
      setError({
        title: "Opprettelse av utkast feilet",
        body: `Feilkode: ${response.status}`,
      });
    }
  };

  return (
    <UtkastFrame>
      <Heading size="xs" tag="h3">
        {t("utkast.Opprett et nytt utkast")}
      </Heading>
      <BlockLabel>
        {t("utkast.Navn på utkast")}
        <Input
          placeholder={t("f.eks. Endring av stemmekrets i Froland")}
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
        <Button onClick={() => setCreateUtkastOpen(false)} variant="tertiary">
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
  );
};

export default UtkastToolbar;
