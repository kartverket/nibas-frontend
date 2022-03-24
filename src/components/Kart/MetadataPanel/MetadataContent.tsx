import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { SubmitHandler, useForm } from "react-hook-form";
import styled, { css } from "styled-components";
import { updateGrenser } from "api/grenser";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import useNibasApi from "hooks/useNibasApi";
import { Metadata } from "types/api";

const getDateInFriendlyString = (dateString?: string) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

const getDateStringFromISOString = (dateString: string) =>
  dateString.replace(/T.+$/g, "");

const getDateStringToUTC = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toISOString();
};

const getUpdatedMetadata = (data: Inputs, oldMetadata: Metadata) =>
  ({
    ...(oldMetadata ?? {}),
    common: {
      ...(oldMetadata.common ?? {}),
      informasjonselementer: [data.informasjon],
      opphav: data.opphav,
      gyldigFra: getDateStringToUTC(data.gyldigFra),
      gyldigTil: getDateStringToUTC(data.gyldigTil),
      posisjonskvalitet: {
        ...(oldMetadata?.common?.posisjonskvalitet ?? {}),
        maalemetode: data.maalemetode,
      },
    },
  } as Metadata);

type Inputs = {
  grenseType: string;
  maalemetode: string;
  informasjon: string;
  opphav: string;
  gyldigFra: string;
  gyldigTil: string;
};

type Props = {
  feature: Feature<Geometry>;
};

const MetadataContent = ({ feature }: Props) => {
  const properties = feature.getProperties();
  const type = properties.type;
  const metadata = properties.metadata as Metadata;

  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      informasjon: metadata?.common?.informasjonselementer[0] ?? "",
      grenseType: metadata?.discriminator ?? "",
      maalemetode: metadata?.common?.posisjonskvalitet?.maalemetode ?? "",
      opphav: metadata?.common?.opphav ?? "",
      gyldigFra: getDateStringFromISOString(metadata?.common?.gyldigFra ?? ""),
      gyldigTil: getDateStringFromISOString(metadata?.common?.gyldigTil ?? ""),
    },
  });

  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: maalemetodeKoder } = useNibasApi(
    "/v1/kodeliste/maalemetode-koder"
  );

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const newFeature = feature;
    const oldProperties = feature.getProperties();

    const newMetadata = getUpdatedMetadata(data, oldProperties.metadata);

    newFeature.setId(feature.getId());
    newFeature.setProperties({
      ...oldProperties,
      metadata: newMetadata,
    });

    updateGrenser([newFeature], tokenHolderFunc()?.token);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Container>
        <Part>
          <BlockLabel>
            Grensetype
            <Select disabled>
              <option>{type}</option>
            </Select>
          </BlockLabel>
          <BlockLabel>
            Målemetode
            <Select {...register("maalemetode")}>
              <option value="">---</option>
              {maalemetodeKoder?.map((kodeItem) => (
                <option key={kodeItem.item.uuid} value={kodeItem.item.uuid}>
                  {kodeItem.item.label}
                </option>
              ))}
            </Select>
          </BlockLabel>
        </Part>
        <Part>
          <BlockLabel>
            Gyldig fra
            <Input type="date" {...register("gyldigFra")} />
          </BlockLabel>
          <BlockLabel>
            Gyldig til
            <Input type="date" {...register("gyldigTil")} />
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
        <Input {...register("informasjon")} />
      </BlockLabel>
      <BlockLabel>
        Opphav
        <Input {...register("opphav")} />
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

export default MetadataContent;
