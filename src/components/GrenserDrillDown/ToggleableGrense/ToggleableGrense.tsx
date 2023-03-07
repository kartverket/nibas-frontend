import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import Button, { LinkButton } from "components/form/Button";
import Icon from "components/Icon";
import { EditingType } from "contexts/EditGrenserContext";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { GrenseRef } from "types/api";
import { useTranslation } from "react-i18next";
import { getIdFromEntity } from "utils/api";
import { Outline } from "style/mixins";

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
    <Wrapper visible={value.visible ? true : false}>
      <Button
        onClick={toggleVisible}
        variant="unstyled"
        {...(value.visible ? {icon: 'visibility', iconAriaLabel: 'Synlig'} : {icon: 'visibility_off', iconAriaLabel: 'Usynlig'})}
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
  user-select: none;
`;

const Wrapper = styled.div<{ visible: boolean }>`
  display: flex;
  align-items: center;
  margin: 16px 0 0 24px;

  > :first-child {
    color: ${({ visible }) => (visible ? "var(--white)" : "var(--blue_dark)")};
    padding: 8px;
    border-radius: 50%;
    background: ${({ visible }) =>
      visible ? "var(--blue_dark)" : "transparent"};

    &:hover {
      background: var(--blue_light);
      color: var(--blue_dark);
    }

    &:focus-visible {
      ${Outline}
    }
  }

  ${LinkButton} {
    &:hover:enabled {
      text-decoration: none;
    }

    &:focus-visible {
      ${Outline}
    }
  }
`;

export default ToggleableGrense;
