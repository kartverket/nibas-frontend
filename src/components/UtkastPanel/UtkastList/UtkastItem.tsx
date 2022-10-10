import { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import { Link, useMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSWRConfig } from "swr";
import UtkastItemActive from "./UtkastItemActive";
import { publishUtkast } from "api/utkast";
import Button from "components/form/Button";
import Input from "components/form/Input";
import { BlockLabel } from "components/Kart/MetadataPanel/metadataComponents";
import useNibasApi from "hooks/useNibasApi";
import { ReactComponent as EditIcon } from "icons/edit.svg";
import { ReactComponent as PublishIcon } from "icons/pluss.svg";
import { UtkastRef } from "types/api";

type Props = {
  utkast: UtkastRef;
};

const UtkastItem = ({ utkast }: Props) => {
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  const { t } = useTranslation();
  const utkastId = useMatch("/:utkastId")?.params.utkastId;
  const { data: fullUtkast } = useNibasApi(
    isPublishOpen ? "/v1/utkast/{id}" : null,
    {
      id: utkast.id,
    }
  );
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { mutate } = useSWRConfig();
  const navigate = useNavigate();

  const utkastActive = utkastId === utkast.id;

  const publish = async () => {
    if (!fullUtkast) return;

    await publishUtkast(utkast.id, fullUtkast, tokenHolderFunc()?.token);

    await mutate(["/v1/utkast", tokenHolderFunc()?.token]);
    navigate("/");
    // TODO: Modal/toast om at utkastet er publisert?
  };

  return (
    <ListItem>
      <ItemWrapper>
        <UtkastName>{utkast.navn}</UtkastName>
        <UnstyledButton onClick={() => setIsPublishOpen(true)}>
          <PublishIcon aria-label={`Publiser ${utkast.navn}`} />
        </UnstyledButton>
        <UnstyledButton>
          <Link to={`/${utkast.id}`}>
            <EditIcon aria-label={`Aktiver ${utkast.navn}`} />
          </Link>
        </UnstyledButton>
      </ItemWrapper>
      {isPublishOpen && (
        <UtkastItemExpanded>
          <ButtonsAndGyldigFra>
            <BlockLabel>
              {t("metadata.Gyldig fra")}
              <Input
                value={fullUtkast?.gyldigFra ?? ""}
                disabled
                role="textbox"
                type="date"
              />
            </BlockLabel>
            <Buttons>
              <CancelButton onClick={() => setIsPublishOpen(false)}>
                {t("action.Avbryt")}
              </CancelButton>
              <Button onClick={publish}>{t("action.Publiser")}</Button>
            </Buttons>
          </ButtonsAndGyldigFra>
        </UtkastItemExpanded>
      )}
      {utkastActive && !isPublishOpen && (
        <UtkastItemActive utkastId={utkast.id} />
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

export const UtkastItemExpanded = styled.div`
  border-top: 2px solid ${({ theme }) => theme.colors.black};
  background-color: ${({ theme }) => theme.colors.grayLight};
  padding: 32px 16px;
`;

const Buttons = styled.div`
  flex: 1;
  text-align: right;
`;

export const ButtonsAndGyldigFra = styled.div`
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
      width: 130px;
    }
  }
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
