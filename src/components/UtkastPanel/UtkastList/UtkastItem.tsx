import { useEffect, useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { publishUtkast } from "api/utkast";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import { BlockLabel } from "components/Kart/MetadataPanel/metadataComponents";
import { translateKeysByEndringsType } from "contexts/UtkastContext/constants";
import useNibasApi from "hooks/useNibasApi";
import { Translation } from "i18n";
import { ReactComponent as EditIcon } from "icons/edit.svg";
import { ReactComponent as PublishIcon } from "icons/pluss.svg";
import { UtkastRef } from "types/api";

type Inputs = {
  navn: string;
  gyldigFra: string;
  endringsType: string;
  // kommentar: string;
};

type Props = {
  utkast: UtkastRef;
};

const UtkastItem = ({ utkast }: Props) => {
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const { register, handleSubmit, setValue } = useForm<Inputs>();

  const { t } = useTranslation();
  const utkastId = useMatch("/:utkastId")?.params.utkastId;
  const { data: fullUtkast } = useNibasApi(
    isPublishOpen ? "/v1/utkast/{id}" : null,
    {
      id: utkast.id,
    }
  );
  const { tokenHolderFunc } = useAuthenticationFlow();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fullUtkast) return;

    setValue("navn", fullUtkast.navn);
    setValue("endringsType", fullUtkast.endringstype);
    setValue("gyldigFra", fullUtkast.gyldigFra);

    // når vi får støtte for feltet
    // setValue("kommentar", fullUtkast.kommentar);
  }, [fullUtkast, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (!fullUtkast) return;

    const newUtkast = {
      ...fullUtkast,
      navn: data.navn,
      gyldigFra: data.gyldigFra,
      // kommentar: data.kommentar,
    };

    await publishUtkast(fullUtkast.id, newUtkast, tokenHolderFunc()?.token);

    navigate("/");
  });

  const utkastActive = utkastId === utkast.id;

  return (
    <ListItem>
      <ItemWrapper>
        <UtkastName>{utkast.navn}</UtkastName>
        <UnstyledButton onClick={() => setIsPublishOpen(true)}>
          <PublishIcon />
        </UnstyledButton>
        <UnstyledButton>
          <Link to={`/${utkast.id}`}>
            <EditIcon />
          </Link>
        </UnstyledButton>
      </ItemWrapper>
      {isPublishOpen && (
        <UtkastItemExpanded>
          <form onSubmit={onSubmit}>
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
              <Buttons>
                <CancelButton onClick={() => setIsPublishOpen(false)}>
                  {t("action.Avbryt")}
                </CancelButton>
                <Button type="submit">{t("action.Publiser")}</Button>
              </Buttons>
            </ButtonsAndGyldigFra>
          </form>
        </UtkastItemExpanded>
      )}
      {utkastActive && !isPublishOpen && (
        <EditingUtkast>
          <EditingUtkastText>
            {t("utkast.Du er nå i redigeringsmodus av dette utkastet")}
          </EditingUtkastText>
          <CancelButton>
            <Link to="">{t("action.Avbryt redigering")}</Link>
          </CancelButton>
        </EditingUtkast>
      )}
    </ListItem>
  );
};

const ItemWrapper = styled.div`
  margin-bottom: 8px;
  display: flex;

  > :first-child {
    flex: 1;
  }
`;

const ListItem = styled.li`
  margin-right: 8px;
  margin-bottom: 8px;
`;

const UtkastName = styled.p`
  margin: 0;
`;

const UtkastItemExpanded = styled.div`
  border-top: 2px solid ${({ theme }) => theme.colors.black};
  background-color: ${({ theme }) => theme.colors.grayLight};
  padding: 32px 16px;
`;

const EditingUtkastText = styled.p`
  margin: 0;
  margin-bottom: 8px;
  font-style: italic;
  font-size: 14px;
`;

const Buttons = styled.div`
  flex: 1;
  text-align: right;
`;

const ButtonsAndGyldigFra = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  .button:first-child {
    margin-right: 4px;
  }

  label {
    margin-bottom: 1px;

    input {
      display: block;
      margin-bottom: 0;
      width: 120px;
    }
  }
`;

const EditingUtkast = styled(UtkastItemExpanded)`
  text-align: center;
`;

const CancelButton = styled(Button).attrs(() => ({
  variant: "teriary",
}))`
  background-color: ${({ theme }) => theme.colors.grayLight};
  border: none;
  color: ${({ theme }) => theme.colors.blue};
`;

const UnstyledButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))``;

export default UtkastItem;
