import { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { BlockLabel } from "../MetadataPanel/metadataComponents";
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
};

const CreateUtkastToolbar = ({ closeCreateUtkast }: Props) => {
  const { t } = useTranslation();
  const [utkastName, setUtkastName] = useState("");
  const [utkastType, setUtkastType] = useState("");
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { history, clearHistory } = useToolbar();
  const navigate = useNavigate();

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
    clearHistory();
    navigate(`/${utkastId}`);
  };

  return (
    <ToolbarWrapper>
      <Wrapper>
        <BlockLabel>
          {t("utkast.Navn på utkast")}
          <Input
            value={utkastName}
            onChange={(e) => setUtkastName(e.target.value)}
          />
        </BlockLabel>
        <BlockLabel>
          {t("utkast.Type utkast")}
          <Select
            value={utkastType}
            onChange={(e) => setUtkastType(e.target.value)}
          >
            <option value="" disabled>
              ---
            </option>
            {Object.keys(translateKeysByEndringsType).map((type) => (
              <option key={type} value={type}>
                {t(translateKeysByEndringsType[type] as Translation)}
              </option>
            ))}
          </Select>
        </BlockLabel>

        <Button onClick={closeCreateUtkast} variant="secondary">
          {t("action.Lukk")}
        </Button>
        <Button onClick={createUtkast} disabled={utkastType === ""}>
          {t("action.Lagre som")}
        </Button>
      </Wrapper>
    </ToolbarWrapper>
  );
};

const Wrapper = styled.div`
  .button {
    margin-bottom: 0;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export default CreateUtkastToolbar;
