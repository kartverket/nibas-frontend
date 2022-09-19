import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import { Translation } from "i18n";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { UtkastType } from "types/api";
import { BlockLabel } from "../MetadataPanel/metadataComponents";
import { createUtkast as createApiUtkast } from "api/utkast";

const utkastTypesToString: Record<UtkastType, string> = {
  IKKE_DEFINERT: "utkast.Ikke definert",
  VEDTATT_GRENSEENDRING: "utkast.Vedtatt grenseendring",
  VEDTATT_SAMMENSLAAING: "utkast.Vedtatt sammenslåing",
};

type Props = {
  closeCreateUtkast: () => void;
};

const CreateUtkastToolbar = ({ closeCreateUtkast }: Props) => {
  const { t } = useTranslation();
  const [utkastName, setUtkastName] = useState("");
  const [utkastType, setUtkastType] = useState<UtkastType>("IKKE_DEFINERT");
  const { tokenHolderFunc } = useAuthenticationFlow();

  const createUtkast = async () => {
    // const response = await createApiUtkast(
    //   {
    //     navn: utkastName,
    //     endringstype: utkastType,
    //   },
    //   tokenHolderFunc()?.token
    // );
  };

  return (
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
          onChange={(e) => setUtkastType(e.target.value as UtkastType)}
        >
          {Object.keys(utkastTypesToString).map((type) => (
            <option key={type} value={type}>
              {t(utkastTypesToString[type as UtkastType] as Translation)}
            </option>
          ))}
        </Select>
      </BlockLabel>

      <Button onClick={closeCreateUtkast} variant="secondary">
        {t("action.Lukk")}
      </Button>
      <Button onClick={createUtkast}>{t("action.Lagre som")}</Button>
    </Wrapper>
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
