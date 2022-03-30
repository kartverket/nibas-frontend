import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled, { css } from "styled-components";
import useMetadataForm from "./useMetadataForm";
import { getDateInFriendlyString } from "./utils";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";
import { Metadata, FeatureProperties } from "types/api";

const editingTypeByKontekstType = {
  KOMMUNE: "kommune",
  FYLKE: "fylke",
  NASJON: "nasjon",
} as const;

type Props = {
  feature: Feature<Geometry>;
};

const MetadataContent = ({ feature }: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const type = properties.type;
  const metadata = properties.metadata as Metadata;

  const { register, onSubmit, maalemetodeKoder } = useMetadataForm(
    metadata,
    feature
  );

  const { values } = useEditGrenser(
    editingTypeByKontekstType[properties.kontekstEgenskaper?.type ?? "FYLKE"]
  );

  const featureKontekstId = properties.kontekstEgenskaper?.id;
  const isDisabled = featureKontekstId
    ? values[featureKontekstId].visible && !values[featureKontekstId].editing
    : true;

  return (
    <form onSubmit={onSubmit}>
      <Container>
        <Part>
          <BlockLabel>
            Grensetype
            <Select disabled>
              <option>{type}</option>
            </Select>
          </BlockLabel>
          <DateWrapper>
            <BlockLabel>
              Gyldig fra
              <Input
                type="date"
                role="textbox"
                {...register("gyldigFra", { disabled: isDisabled })}
              />
            </BlockLabel>
            <BlockLabel>
              Gyldig til
              <Input
                type="date"
                role="textbox"
                {...register("gyldigTil", { disabled: isDisabled })}
              />
            </BlockLabel>
          </DateWrapper>
        </Part>
        <Part>
          <BlockLabel>
            Målemetode
            <Select {...register("maalemetode", { disabled: isDisabled })}>
              <option value="">---</option>
              {maalemetodeKoder?.map((kodeItem) => (
                <option key={kodeItem.item.uuid} value={kodeItem.item.uuid}>
                  {kodeItem.item.label}
                </option>
              ))}
            </Select>
          </BlockLabel>
          <BlockLabel>
            Nøyaktighet
            <Input
              type="number"
              {...register("noeyaktighet", {
                valueAsNumber: true,
                disabled: isDisabled,
              })}
            />
          </BlockLabel>
        </Part>
        <Part>
          <div>
            <MetadataText>Oppdateringsdato</MetadataText>
            <MetadataValue>
              {getDateInFriendlyString(metadata?.common?.oppdateringsdato) ??
                "---"}
            </MetadataValue>
          </div>
          <div>
            <MetadataText>Datafangstdato</MetadataText>
            <MetadataValue>
              {getDateInFriendlyString(metadata?.common?.datafangstdato) ??
                "---"}
            </MetadataValue>
          </div>
        </Part>
      </Container>
      <BlockLabel>
        Informasjon
        <Input {...register("informasjon", { disabled: isDisabled })} />
      </BlockLabel>
      <BlockLabel>
        Opphav
        <Input {...register("opphav", { disabled: isDisabled })} />
      </BlockLabel>
      <Button type="submit">Lagre</Button>
    </form>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const Part = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 16px;

  &:first-child,
  &:last-child {
    margin: 0;
  }
`;

const MetadataTitleStyles = css`
  font-size: 14px;
`;

const MetadataValue = styled.p`
  margin: 0;
  margin-bottom: 8px;
`;

const MetadataText = styled.p`
  margin: 0;
  ${MetadataTitleStyles};
`;

const BlockLabel = styled.label`
  display: block;
  margin-bottom: 8px;

  ${MetadataTitleStyles};

  > * {
    margin-top: 4px;
    width: 100%;
    margin-bottom: 8px;
  }
`;

const DateWrapper = styled(Part)`
  display: flex;

  > * {
    flex: 1;
    margin: 0 8px;
    min-width: 100px;

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }
`;

export default MetadataContent;
