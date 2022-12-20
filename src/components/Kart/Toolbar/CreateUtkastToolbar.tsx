import { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { BlockLabel } from "../OverlayPanels/metadataComponents";
import { ToolbarWrapper } from "./components";
import { createUtkast as createApiUtkast } from "api/utkast";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import { useToolbar } from "contexts/ToolbarContext";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import { Translation } from "i18n";

type Props = {
  closeCreateUtkast: () => void;
  promptUtkast: () => void;
};

const CreateUtkastToolbar = ({ closeCreateUtkast, promptUtkast }: Props) => {
  const { t } = useTranslation();
  const [utkastName, setUtkastName] = useState("");
  const [utkastType, setUtkastType] = useState("");
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { history, clearHistory } = useToolbar();
  const setSearchParams = useSearchParams()[1];

  const createUtkast = async () => {
    // TODO: Her må det legges til noe feilmelding til brukeren :)
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

    closeCreateUtkast();
    setSearchParams({ utkast: utkastId });
    clearHistory();
    promptUtkast();
  };

  return (
    <ToolbarWrapperCreateUtkast>
      <Wrapper>
        <BlockLabel>
          {t("utkast.Navn på utkast")}
          <Input
            value={utkastName}
            onChange={(e) => setUtkastName(e.target.value)}
            placeholder="f.eks. Endring av stemmekrets i Froland"
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
          <CloseUtkastButton onClick={closeCreateUtkast} variant="unstyled">
            {t("action.Avbryt")}
          </CloseUtkastButton>
          <Button
            onClick={createUtkast}
            disabled={utkastType === "" || utkastName === ""}
          >
            {t("action.Opprett")}
          </Button>
        </Buttons>
      </Wrapper>
    </ToolbarWrapperCreateUtkast>
  );
};

const CloseUtkastButton = styled(Button)`
  padding: 0 16px;
  color: var(--blue);
  font-weight: bold;

  &:hover {
    text-decoration: underline;
    text-underline-position: under;
  }
`;

const ToolbarWrapperCreateUtkast = styled(ToolbarWrapper)`
  display: flex;
  flex-direction: coloumn;
  gap: 28px;
  width: 352px;
  margin-left: auto;
  margin-right: 0;
  margin-top: 0;
  border-top: 0;

  p {
    margin-top: 0;
  }
`;

const Buttons = styled.div`
  margin-left: auto;
  margin-right: 0;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  .button {
    margin-bottom: 0;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export default CreateUtkastToolbar;
