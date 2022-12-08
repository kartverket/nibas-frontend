import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import Button, { LinkButton } from "components/form/Button";
import Icon from "components/Icon";
import { EditingType } from "contexts/EditGrenserContext";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { GrenseId } from "hooks/layers/types";
import { GrenseRef } from "types/api";
import { useTranslation } from "react-i18next";

export const layerIdByGrenseType: Record<EditingType, GrenseId> = {
  fylke: "fylker",
  kommune: "kommuner",
  nasjon: "nasjoner",
  grunnkrets: "grunnkretser",
  stemmekrets: "stemmekretser",
};

type Props<T extends GrenseRef> = {
  grense: T;
  title: string;
  type: EditingType;
  features: Feature<Geometry>[] | null;
};

const ToggleableGrense = <T extends GrenseRef>({
  grense,
  title,
  type,
  features,
}: Props<T>) => {
  const { t } = useTranslation();
  const { value, toggleVisible } = useEditGrense(type, grense.id, features);

  const openInfo = () => {
    // todo
  };

  return (
    <Wrapper visible={value.visible ? true : false}>
      <Button
        onClick={toggleVisible}
        variant="unstyled"
        icon={
          value.visible ? (
            <Icon icon="visibility" aria-label="Synlig" />
          ) : (
            <Icon icon="visibility_off" aria-label="Usynlig" />
          )
        }
      />
      <Title>{title}</Title>
      <LinkButton onClick={openInfo} disabled title="Kommer snart!">
        {value.editing ? t("action.Avslutt redigering") : t("action.Rediger")}
      </LinkButton>
    </Wrapper>
  );
};
const Title = styled.div`
  flex: 1;
  margin-left: 8px;
  cursor: default;
`;

const Wrapper = styled.div<{ visible: boolean }>`
  display: flex;
  align-items: center;
  margin: 16px 0 0 24px;

  > :first-child {
    color: ${({ theme, visible }) =>
      visible ? theme.colors.white : theme.colors.blueDark};
    padding: 8px;
    border-radius: 50%;
    background: ${({ theme, visible }) =>
      visible ? theme.colors.blueDark : "transparent"};

    &:hover {
      background: ${({ theme }) => theme.colors.blueLight};
      color: ${({ theme }) => theme.colors.blueDark};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.blueDark};
      outline-offset: 2px;
    }
  }

  ${LinkButton} {
    &:hover:enabled {
      text-decoration: none;
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.blueDark};
      outline-offset: 2px;
    }
  }
`;

export default ToggleableGrense;
