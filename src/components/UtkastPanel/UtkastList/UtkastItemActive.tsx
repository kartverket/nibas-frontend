import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { ButtonsAndGyldigFra, UtkastItemExpanded } from "./UtkastItem";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import { BlockLabel } from "components/Kart/MetadataPanel/metadataComponents";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import useNibasApi from "hooks/useNibasApi";
import { Translation } from "i18n";

type Inputs = {
  navn: string;
  gyldigFra: string;
  endringsType: string;
  // kommentar: string;
};

type Props = {
  utkastId: string;
};

const UtkastItemActive = ({ utkastId }: Props) => {
  const { t } = useTranslation();
  const { register, setValue } = useForm<Inputs>();
  const { data: fullUtkast } = useNibasApi("/v1/utkast/{id}", {
    id: utkastId,
  });

  useEffect(() => {
    if (!fullUtkast) return;

    setValue("navn", fullUtkast.navn);
    setValue("endringsType", fullUtkast.endringstype);
    setValue("gyldigFra", fullUtkast.gyldigFra);

    // når vi får støtte for feltet
    // setValue("kommentar", fullUtkast.kommentar);
  }, [fullUtkast, setValue]);

  return (
    <UtkastItemExpanded>
      <BlockLabel>
        {t("utkast.Navn på utkast")}
        <Input {...register("navn")} />
      </BlockLabel>
      <BlockLabel>
        {t("utkast.Type utkast")}
        <Select {...register("endringsType")}>
          {Object.keys(translateKeysByEndringsType).map((type) => (
            <option key={type} value={type}>
              {t(translateKeysByEndringsType[type] as Translation)}
            </option>
          ))}
        </Select>
      </BlockLabel>
      {/* <BlockLabel>
            {t("Kommentar")}
            <Input {...register("kommentar")} />
          </BlockLabel> */}
      <ButtonsAndGyldigFra>
        <BlockLabel>
          {t("metadata.Gyldig fra")}
          <Input {...register("gyldigFra")} role="textbox" type="date" />
        </BlockLabel>
      </ButtonsAndGyldigFra>
      <Center>
        <EditingUtkastText>
          {t("utkast.Du er nå i redigeringsmodus av dette utkastet")}
        </EditingUtkastText>
        <CancelButton>
          <Link to="">{t("action.Avbryt redigering")}</Link>
        </CancelButton>
      </Center>
    </UtkastItemExpanded>
  );
};

const EditingUtkastText = styled.p`
  margin: 0;
  margin-bottom: 8px;
  margin-top: 16px;
  font-style: italic;
  font-size: 14px;
`;

const Center = styled.div`
  text-align: center;
`;

const CancelButton = styled(Button).attrs(() => ({
  variant: "teriary",
}))`
  background-color: ${({ theme }) => theme.colors.grayLight};
  border: none;
  color: ${({ theme }) => theme.colors.blue};
`;

export default UtkastItemActive;
