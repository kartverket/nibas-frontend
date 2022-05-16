import { useEffect } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { BlockLabel, Container, Part } from "../../metadataComponents";
import useIsMetadataDisabled from "../../useIsMetadataDisabled";
import { updateGrenser } from "api/grenser";
import Checkbox from "components/Checkbox";
import Button from "components/form/Button";
import Select from "components/form/Select";
import useNibasApi from "hooks/useNibasApi";
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

  const { data: terrengdetaljkoder } = useNibasApi(
    "/v1/kodeliste/terrengdetaljkoder"
  );
  const { data: noeyaktighetsklassekoder } = useNibasApi(
    "/v1/kodeliste/noeyaktighetsklasser"
  );

  useEffect(() => {
    if (!terrengdetaljkoder) return;

    const selectedFoelgerTerrengdetaljkode = terrengdetaljkoder.items.find(
      (kode) => kode.id === metadata.foelgerTerrengdetalj?.id
    );

    if (!selectedFoelgerTerrengdetaljkode) return;

    setValue("foelgerTerrengdetalj", selectedFoelgerTerrengdetaljkode.id);
  }, [terrengdetaljkoder, setValue, metadata.foelgerTerrengdetalj?.id]);

  useEffect(() => {
    if (!noeyaktighetsklassekoder) return;

    const selectedNoeyaktighetsklassekode = noeyaktighetsklassekoder.items.find(
      (kode) => kode.id === metadata.noeyaktighetsklasse?.id
    );

    if (!selectedNoeyaktighetsklassekode) return;

    setValue("noeyaktighetsklasse", selectedNoeyaktighetsklassekode.id);
  }, [noeyaktighetsklassekoder, setValue, metadata.noeyaktighetsklasse?.id]);

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
          <BlockLabel>
            {t("metadata.Følger terrengdetalj")}
            <Select {...register("foelgerTerrengdetalj", { disabled })}>
              <option value="">---</option>
              {terrengdetaljkoder?.items.map((kodeItem) => (
                <option key={kodeItem.id} value={kodeItem.id}>
                  {kodeItem.label}
                </option>
              ))}
            </Select>
          </BlockLabel>
        </Part>
        <Part>
          <BlockLabel>
            {t("metadata.Nøyaktighetsklasse")}
            <Select {...register("noeyaktighetsklasse", { disabled })}>
              <option value="">---</option>
              {noeyaktighetsklassekoder?.items.map((kodeItem) => (
                <option key={kodeItem.id} value={kodeItem.id}>
                  {kodeItem.label}
                </option>
              ))}
            </Select>
          </BlockLabel>
        </Part>
      </TwoPartsContainer>

      <div>
        <RadioTitle>{t("metadata.Omtvistet")}</RadioTitle>
        <Checkbox
          type="radio"
          label="Ja"
          {...register("omtvistet", { disabled })}
          value="Ja"
        />
        <Checkbox
          type="radio"
          label="Nei"
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
