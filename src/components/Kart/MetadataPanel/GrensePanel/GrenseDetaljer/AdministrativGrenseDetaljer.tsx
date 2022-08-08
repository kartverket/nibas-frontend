import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import AsyncKodelisteSelect from "../../AsyncKodelisteSelect";
import { Container, Part } from "../../metadataComponents";
import useAsyncKodeliste from "../../useAsyncKodeliste";
import useIsMetadataDisabled from "../../useIsMetadataDisabled";
import { updateGrenser } from "api/grenser";
import Checkbox from "components/Checkbox";
import Button from "components/form/Button";
import { AdministrativGrenseMetadata, FeatureProperties } from "types/api";

type Inputs = {
  foelgerTerrengdetalj: string;
  noeyaktighetsklasse: string;
  omtvistet: string;
};

type Props = {
  feature: Feature<Geometry>;
};

const AdministrativGrenseDetaljer = ({ feature }: Props) => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { t } = useTranslation();

  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as AdministrativGrenseMetadata;

  const { register, handleSubmit, setValue } = useForm<Inputs>({
    defaultValues: {
      foelgerTerrengdetalj: metadata.foelgerTerrengdetalj?.id,
      noeyaktighetsklasse: metadata.noeyaktighetsklasse?.id,
      omtvistet: metadata.omtvistet ? "Ja" : "Nei",
    },
  });

  const terrengdetaljkoder = useAsyncKodeliste({
    setValue,
    property: "foelgerTerrengdetalj",
    initialItemId: metadata.foelgerTerrengdetalj?.id,
    kodelisteUrl: "/v1/kodeliste/terrengdetaljkoder",
  });

  const noeyaktighetsklassekoder = useAsyncKodeliste({
    setValue,
    property: "noeyaktighetsklasse",
    initialItemId: metadata.noeyaktighetsklasse?.id,
    kodelisteUrl: "/v1/kodeliste/noeyaktighetsklasser",
  });

  const onSubmit = handleSubmit((data) => {
    const newProperties: FeatureProperties = {
      ...properties,
      metadata: {
        ...properties.metadata,
        foelgerTerrengdetalj: {
          id: data.foelgerTerrengdetalj,
        },
        noeyaktighetsklasse: {
          id: data.noeyaktighetsklasse,
        },
        omtvistet: data.omtvistet === "Ja",
      } as AdministrativGrenseMetadata,
    };

    feature.setProperties(newProperties);

    updateGrenser([feature], tokenHolderFunc()?.token);
  });

  const disabled = useIsMetadataDisabled(properties);

  return (
    <form onSubmit={onSubmit}>
      <TwoPartsContainer>
        <Part>
          <AsyncKodelisteSelect
            label={t("metadata.Følger terrengdetalj")}
            kodeliste={terrengdetaljkoder}
            {...register("foelgerTerrengdetalj", { disabled })}
          />
        </Part>
        <Part>
          <AsyncKodelisteSelect
            label={t("metadata.Nøyaktighetsklasse")}
            kodeliste={noeyaktighetsklassekoder}
            {...register("noeyaktighetsklasse", { disabled })}
          />
        </Part>
      </TwoPartsContainer>

      <div>
        <RadioTitle>{t("metadata.Omtvistet")}</RadioTitle>
        <Checkbox
          type="radio"
          label={t("Ja")}
          {...register("omtvistet", { disabled })}
          value="Ja"
        />
        <Checkbox
          type="radio"
          label={t("Nei")}
          {...register("omtvistet", { disabled })}
          value="Nei"
        />
      </div>

      <Button type="submit">{t("action.Lagre")}</Button>
    </form>
  );
};

const RadioTitle = styled.p`
  margin: 0;
  margin-bottom: 8px;
  font-size: 14px;
`;

const TwoPartsContainer = styled(Container)`
  ${Part}:first-child {
    margin-right: 8px;
  }

  ${Part}:last-child {
    margin-left: 8px;
  }
`;

export default AdministrativGrenseDetaljer;
