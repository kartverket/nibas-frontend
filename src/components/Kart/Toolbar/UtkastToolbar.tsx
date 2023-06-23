import { useState } from "react";
import { styled } from "styled-components";
import { useSearchParams } from "react-router-dom";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useHistory } from "contexts/HistoryContext";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import { createUtkast as createApiUtkast } from "api/utkast";
import Input from "components/form/Input";
import Select from "components/form/Select";
import { Frame } from "./components";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { statusCode } from "utils/api";
import { ApiErrorResponse } from "../../../types/api";
import { Button, Heading } from "@kvib/react";

const UtkastFrame = styled(Frame)`
  flex-direction: column;
  width: 365px;
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
  const [createUtkastLoading, setCreateUtkastLoading] = useState(false);
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
    setCreateUtkastLoading(true);
    const response = await createApiUtkast(
      {
        navn: utkastName,
        endringstype: utkastType,
        operasjoner: historyToUtkastOperations(history),
      },
      tokenHolderFunc()?.token
    );

    setCreateUtkastLoading(false);
    if (statusCode.isSuccessful(response.status)) {
      const json = await response.json();
      const utkastId = json.id;

      setCreateUtkastOpen(false);
      setSearchParams({ utkast: utkastId });
      clearHistory({ hasPreviouslySavedHistory: true });
      promptUtkast();
    } else if (statusCode.isError(response.status)) {
      const wrapper = (await response.json()) as ApiErrorResponse;
      setError({
        ...wrapper.errorDescription,
        errorCode: wrapper.errorCode,
      });
    }
  };

  return (
    <UtkastFrame>
      <Heading size="sm" as="h3">
        Opprett et nytt utkast
      </Heading>
      <Input
        label="Navn på utkast"
        placeholder="f.eks. Endring av stemmekrets i Froland"
        value={utkastName}
        onChange={(e) => setUtkastName(e.target.value)}
      />
      <Select
        label="Endringstype"
        value={utkastType}
        onChange={(e) => setUtkastType(e.target.value)}
      >
        <option value="" disabled>
          Velg en endringstype fra listen
        </option>
        {translateKeysByEndringsType.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>
      <Buttons>
        <Button onClick={() => setCreateUtkastOpen(false)} variant="ghost">
          Avbryt
        </Button>
        <Button
          onClick={createUtkast}
          isDisabled={utkastType === "" || utkastName === ""}
          isLoading={createUtkastLoading}
        >
          Opprett
        </Button>
      </Buttons>
    </UtkastFrame>
  );
};

export default UtkastToolbar;
