import { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import { useMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSWRConfig } from "swr";
import UtkastItemActive from "./UtkastItemActive";
import { deleteUtkast as deleteApiUtkast, publishUtkast } from "api/utkast";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Icon from "components/Icon";
import { BlockLabel } from "components/Kart/MetadataPanel/metadataComponents";
import useNibasApi from "hooks/useNibasApi";
import { UtkastRef } from "types/api";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useMetadataPanel } from "contexts/MetadataPanelContext";
import { resetMapView } from "utils/map";

type Props = {
  utkast: UtkastRef;
};

const UtkastItem = ({ utkast }: Props) => {
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { t } = useTranslation();
  const utkastId = useMatch("/:utkastId")?.params.utkastId;

  const { resetEditingObject } = useEditAllGrenser();
  const { closePanel } = useMetadataPanel();
  const { data: fullUtkast } = useNibasApi(
    isPublishOpen || isDeleteOpen ? "/v1/utkast/{id}" : null,
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

    if (utkastActive) {
      navigate("/");
    }

    // TODO: Modal/toast om at utkastet er publisert?
  };

  const deleteUtkast = async () => {
    if (!fullUtkast) return;

    await deleteApiUtkast(utkast.id, tokenHolderFunc()?.token);

    await mutate(["/v1/utkast", tokenHolderFunc()?.token]);

    if (utkastId === utkast.id) {
      navigate("/");
    }
  };

  const changeUtkast = (url: string) => {
    navigate(`/${url}`);
    resetEditingObject();
    closePanel();
    resetMapView();
  };

  return (
    <ListItem>
      <ItemWrapper>
        <UtkastName>{utkast.navn}</UtkastName>
        <UnstyledButton onClick={() => setIsPublishOpen(true)}>
          <PublishIcon aria-label={`Publiser ${utkast.navn}`} />
        </UnstyledButton>
        <UnstyledButton onClick={() => setIsDeleteOpen(true)}>
          <DeleteIcon aria-label={`Forkast ${utkast.navn}`} />
        </UnstyledButton>
        <UnstyledButton onClick={() => changeUtkast(utkast.id)}>
          <Icon icon="edit" aria-label={`Aktiver ${utkast.navn}`} />
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
      {isDeleteOpen && (
        <UtkastItemExpanded>
          <ButtonsAndGyldigFra>
            <Buttons>
              <CancelButton onClick={() => setIsDeleteOpen(false)}>
                {t("action.Avbryt")}
              </CancelButton>
              <Button onClick={deleteUtkast}>{t("action.Forkast")}</Button>
            </Buttons>
          </ButtonsAndGyldigFra>
        </UtkastItemExpanded>
      )}
      {utkastActive && !isPublishOpen && !isDeleteOpen && (
        <UtkastItemActive utkastId={utkast.id} changeUtkast={changeUtkast} />
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

const PublishIcon = styled(Icon).attrs(() => ({
  icon: "done",
}))`
  color: ${({ theme }) => theme.colors.green};
  margin-right: 8px;
`;

const DeleteIcon = styled(Icon).attrs(() => ({
  icon: "close",
}))`
  color: ${({ theme }) => theme.colors.redErrorText};
  margin-right: 8px;
`;

export default UtkastItem;
