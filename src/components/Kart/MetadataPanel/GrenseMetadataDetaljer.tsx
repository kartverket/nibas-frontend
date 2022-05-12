import { useEffect } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useForm } from "react-hook-form";
import { BlockLabel } from "./metadataComponents";
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

const GrenseMetadataDetaljer = ({ feature }: Props) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  const metadata = feature.getProperties()
    .metadata as AdministrativGrenseMetadata;

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
    const properties = feature.getProperties() as FeatureProperties;

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

  return (
    <form onSubmit={onSubmit}>
      <BlockLabel>
        Følger terrengdetalj
        <Select {...register("foelgerTerrengdetalj", { disabled: false })}>
          <option value="">---</option>
          {terrengdetaljkoder?.items.map((kodeItem) => (
            <option key={kodeItem.id} value={kodeItem.id}>
              {kodeItem.label}
            </option>
          ))}
        </Select>
      </BlockLabel>

      <BlockLabel>
        Nøyaktighetsklasse
        <Select {...register("noeyaktighetsklasse", { disabled: false })}>
          <option value="">---</option>
          {noeyaktighetsklassekoder?.items.map((kodeItem) => (
            <option key={kodeItem.id} value={kodeItem.id}>
              {kodeItem.label}
            </option>
          ))}
        </Select>
      </BlockLabel>

      <div>
        <h4>Omtvistet</h4>
        <Checkbox
          type="radio"
          label="Ja"
          {...register("omtvistet")}
          value="Ja"
        />
        <Checkbox
          type="radio"
          label="Nei"
          {...register("omtvistet")}
          value="Nei"
        />
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
};

export default GrenseMetadataDetaljer;
