import { useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { Translation } from "i18n";
import { useTranslation } from "react-i18next";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useHistory } from "contexts/HistoryContext";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import { createUtkast as createApiUtkast } from "api/utkast";
import Input from "components/form/Input";
import Select from "components/form/Select";
import Button from "components/form/Button";
import Heading from "components/typography/Heading";
import { Frame } from "./components";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { statusCode } from "utils/api";

const UtkastFrame = styled(Frame)`
  flex-direction: column;
  width: 365px;

  ${Heading} {
    margin: 0;
  }
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
  const { history, clearHistory } = useHistory();
  const setSearchParams = useSearchParams()[1];
  const { setError } = useErrorHandling();

  const promptUtkast = () => {
    setUtkastJustCreated(true);

    setTimeout(() => {
      setUtkastJustCreated(false);
    }, 5000);
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

    if (statusCode.isSuccessful(response.status)) {
      const json = await response.json();
      const utkastId = json.id;

      setCreateUtkastOpen(false);
      setSearchParams({ utkast: utkastId });
      clearHistory({ hasPreviouslySavedHistory: true });
      promptUtkast();
    } else if (statusCode.isError(response.status)) {
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
      <Input
        label={t("utkast.Navn på utkast")}
        placeholder={t("f.eks. Endring av stemmekrets i Froland")}
        value={utkastName}
        onChange={(e) => setUtkastName(e.target.value)}
      />
      <Select
        label={t("utkast.Endringstype")}
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
