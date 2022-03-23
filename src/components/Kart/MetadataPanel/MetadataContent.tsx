import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { SubmitHandler, useForm } from "react-hook-form";
import styled, { css } from "styled-components";
import useSWR from "swr";
import { updateGrenser } from "api/grenser";
import { KodelisteItem } from "api/kodelister";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import { fetcher } from "utils/swr";

const getDateInFormat = (dateString?: string) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

type Props = {
  feature: Feature<Geometry>;
};

type Inputs = {
  grenseType: string;
  maalemetode: string;
  informasjon: string;
  opphav: string;
};

const MetadataContent = ({ feature }: Props) => {
  const properties = feature.getProperties();
  const type = properties.type;
  const metadata = properties.metadata;

  const { tokenHolderFunc } = useAuthenticationFlow();

  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      informasjon: metadata?.common?.informasjonselementer[0] ?? "",
      grenseType: type,
      maalemetode: metadata?.common?.maalemetode,
      opphav: metadata?.common?.opphav ?? "",
    },
  });

  const { data: maalemetodeKoder } = useSWR<KodelisteItem[]>(
    "/v1/kodeliste/maalemetode-koder",
    fetcher
  );

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const newFeature = feature.clone();
    const oldProperties = feature.getProperties();

    newFeature.setId(feature.getId());
    newFeature.setProperties({
      ...(oldProperties ?? {}),
      metadata: {
        ...(oldProperties.metadata ?? {}),
        common: {
          ...(oldProperties.metadata.common ?? {}),
          informasjonselementer: [data.informasjon],
          opphav: data.opphav,
          posisjonskvalitet: {
            ...(oldProperties.metadata.common.posisjonskvalitet ?? {}),
            maalemetode: data.maalemetode,
          },
        },
      },
    });

    console.log(data);
    console.log("New feature", newFeature);

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
            <Input
              disabled
              defaultValue={metadata?.common?.gyldigFra ?? "---"}
            />
          </BlockLabel>
          <BlockLabel>
            Gyldig til
            <Input
              disabled
              defaultValue={metadata?.common?.gyldigTil ?? "---"}
            />
          </BlockLabel>
        </Part>
        <Part>
          <div>
            <MetadataText>Oppdateringsdato</MetadataText>
            <MetadataValue>
              {getDateInFormat(metadata?.common?.oppdateringsdato) ?? "---"}
            </MetadataValue>
          </div>
          <div>
            <MetadataText>Datafangsdato</MetadataText>
            <MetadataValue>
              {getDateInFormat(metadata?.common?.datafangstdato) ?? "---"}
            </MetadataValue>
          </div>
        </Part>
      </Container>
      <BlockLabel>
        Informasjon
        <Input
          {...register("informasjon")}
          // defaultValue={metadata?.common?.informasjonselementer[0] ?? "---"}
        />
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
