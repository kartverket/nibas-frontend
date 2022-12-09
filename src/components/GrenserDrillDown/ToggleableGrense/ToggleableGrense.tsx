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
import { getIdFromEntity } from "utils/api";

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
  const { value, toggleVisible } = useEditGrense(
    type,
    getIdFromEntity(grense),
    features
  );

  const openInfo = () => {
    // todo
  };

  return (
    <Wrapper>
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
      <Title onClick={toggleVisible}>{title}</Title>
      <LinkButton onClick={openInfo} disabled title="Kommer snart!">
        {value.editing ? t("action.Avslutt redigering") : t("action.Rediger")}
      </LinkButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;
`;

const Title = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
  flex: 1;
  margin-left: 8px;
`;

export default ToggleableGrense;
