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
import Button from "components/form/Button";
import { FeatureProperties, StatistiskGrenseMetadata } from "types/api";

type Inputs = {
  foelgerTerrengdetalj: string;
  noeyaktighetsklasse: string;
};

type Props = {
  feature: Feature<Geometry>;
};

const StemmekretsgrenseDetaljer = ({ feature }: Props) => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { t } = useTranslation();

  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as StatistiskGrenseMetadata;

  const { register, handleSubmit, setValue } = useForm<Inputs>({
    defaultValues: {
      foelgerTerrengdetalj: metadata.foelgerTerrengdetalj?.id,
      noeyaktighetsklasse: metadata.noeyaktighetsklasse?.id,
    },
  });

  const foelgerTerrengdetaljKodeliste = useAsyncKodeliste({
    initialItemId: metadata.foelgerTerrengdetalj?.id,
    kodelisteUrl: "/v1/kodeliste/terrengdetaljkoder",
    property: "foelgerTerrengdetalj",
    setValue,
  });

  const noeyaktighetsklasseKodeliste = useAsyncKodeliste({
    initialItemId: metadata.noeyaktighetsklasse?.id,
    kodelisteUrl: "/v1/kodeliste/noeyaktighetsklasser",
    property: "noeyaktighetsklasse",
    setValue,
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
      } as StatistiskGrenseMetadata,
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
            kodeliste={foelgerTerrengdetaljKodeliste}
            label={t("metadata.Følger terrengdetalj")}
            {...register("foelgerTerrengdetalj", { disabled })}
          />
        </Part>
        <Part>
          <AsyncKodelisteSelect
            kodeliste={noeyaktighetsklasseKodeliste}
            label={t("metadata.Nøyaktighetsklasse")}
            {...register("noeyaktighetsklasse", { disabled })}
          />
        </Part>
      </TwoPartsContainer>

      <Button type="submit">{t("action.Lagre")}</Button>
    </form>
  );
};

const TwoPartsContainer = styled(Container)`
  @media (max-width: ${({ theme }) => theme.dimensions.lgPx}) {
    gap: 16px;
  }
`;

export default StemmekretsgrenseDetaljer;
