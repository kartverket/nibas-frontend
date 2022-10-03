import { useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import { ObjectEvent } from "ol/Object";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import AsyncKodelisteSelect from "../../AsyncKodelisteSelect";
import { Container, Part } from "../../metadataComponents";
import useAsyncKodeliste from "../../useAsyncKodeliste";
import useIsMetadataDisabled from "../../useIsMetadataDisabled";
import { addMetadataEntryFromFeature } from "../../utils";
import Checkbox from "components/Checkbox";
import { useToolbarSaving } from "contexts/ToolbarContext";
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
  const { t } = useTranslation();

  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as AdministrativGrenseMetadata;

  const { register, setValue, getValues } = useForm<Inputs>({
    defaultValues: {
      foelgerTerrengdetalj: metadata.foelgerTerrengdetalj?.id ?? "",
      noeyaktighetsklasse: metadata.noeyaktighetsklasse?.id ?? "",
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

  const { addEntry } = useToolbarSaving();

  useEffect(() => {
    const updateFormOnPropertyChange = (e: ObjectEvent) => {
      const newMetadata = (e.target as Feature<LineString>).getProperties()
        .metadata as AdministrativGrenseMetadata;

      setValue(
        "foelgerTerrengdetalj",
        newMetadata?.foelgerTerrengdetalj?.id ?? ""
      );
      setValue(
        "noeyaktighetsklasse",
        newMetadata?.noeyaktighetsklasse?.id ?? ""
      );
      setValue("omtvistet", newMetadata.omtvistet ? "Ja" : "Nei");
    };

    feature.on("propertychange", updateFormOnPropertyChange);

    return () => {
      feature.un("propertychange", updateFormOnPropertyChange);
    };
  }, [feature, setValue]);

  const updateDraftFromFeature = () => {
    const { foelgerTerrengdetalj, noeyaktighetsklasse, omtvistet } =
      getValues();
    addMetadataEntryFromFeature(feature as Feature<LineString>, addEntry, {
      ...properties.metadata,
      foelgerTerrengdetalj: {
        id: foelgerTerrengdetalj,
      },
      noeyaktighetsklasse: {
        id: noeyaktighetsklasse,
      },
      omtvistet: omtvistet === "Ja",
    } as AdministrativGrenseMetadata);
  };

  const disabled = useIsMetadataDisabled(properties);

  const inputOptions = {
    onBlur: updateDraftFromFeature,
    disabled,
  };

  return (
    <form>
      <TwoPartsContainer>
        <Part>
          <AsyncKodelisteSelect
            label={t("metadata.Følger terrengdetalj")}
            kodeliste={terrengdetaljkoder}
            {...register("foelgerTerrengdetalj", inputOptions)}
          />
        </Part>
        <Part>
          <AsyncKodelisteSelect
            label={t("metadata.Nøyaktighetsklasse")}
            kodeliste={noeyaktighetsklassekoder}
            {...register("noeyaktighetsklasse", inputOptions)}
          />
        </Part>
      </TwoPartsContainer>

      <div>
        <RadioTitle>{t("metadata.Omtvistet")}</RadioTitle>
        <Checkbox
          type="radio"
          label={t("Ja")}
          {...register("omtvistet", inputOptions)}
          value="Ja"
        />
        <Checkbox
          type="radio"
          label={t("Nei")}
          {...register("omtvistet", inputOptions)}
          value="Nei"
        />
      </div>
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
