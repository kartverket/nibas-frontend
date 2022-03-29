import { useEffect } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { SubmitHandler, useForm } from "react-hook-form";
import styled, { css } from "styled-components";
import {
  getDateInFriendlyString,
  getDateStringFromISOString,
  getDateStringToUTC,
} from "./utils";
import { updateGrenser } from "api/grenser";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import useNibasApi from "hooks/useNibasApi";
import { Metadata } from "types/api";

type Inputs = {
  grenseType: string;
  maalemetode: string;
  noeyaktighet: number;
  informasjon: string;
  opphav: string;
  gyldigFra: string;
  gyldigTil: string;
};

const getUpdatedMetadata = (data: Inputs, oldMetadata: Metadata) =>
  ({
    ...(oldMetadata ?? {}),
    common: {
      ...(oldMetadata.common ?? {}),
      informasjon: data.informasjon,
      opphav: data.opphav,
      gyldigFra: getDateStringToUTC(data.gyldigFra),
      gyldigTil: getDateStringToUTC(data.gyldigTil),
    },
    commonGrense: {
      ...(oldMetadata.commonGrense ?? {}),
      posisjonskvalitet: {
        ...(oldMetadata?.commonGrense?.posisjonskvalitet ?? {}),
        maalemetode: data.maalemetode,
        noeyaktighet: data.noeyaktighet,
      },
    },
  } as Metadata);

type Props = {
  feature: Feature<Geometry>;
};

const MetadataContent = ({ feature }: Props) => {
  const properties = feature.getProperties();
  const type = properties.type;
  const metadata = properties.metadata as Metadata;

  const { register, handleSubmit, setValue } = useForm<Inputs>({
    defaultValues: {
      informasjon: metadata?.common?.informasjon,
      grenseType: metadata?.discriminator,
      noeyaktighet: metadata?.commonGrense?.posisjonskvalitet?.noeyaktighet,
      opphav: metadata?.common?.opphav,
      gyldigFra: getDateStringFromISOString(metadata?.common?.gyldigFra ?? ""),
      gyldigTil: getDateStringFromISOString(metadata?.common?.gyldigTil ?? ""),
    },
  });

  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: maalemetodeKoder } = useNibasApi(
    "/v1/kodeliste/maalemetode-koder"
  );

  // oppdater målemetode tekstfelt når kodene er hentet
  useEffect(() => {
    if (!maalemetodeKoder) return;

    const selectedMaalemetode = maalemetodeKoder.find(
      (kode) =>
        kode.item.uuid === metadata.commonGrense?.posisjonskvalitet?.maalemetode
    );

    if (!selectedMaalemetode) return;

    setValue("maalemetode", selectedMaalemetode.item.uuid);
  }, [
    maalemetodeKoder,
    setValue,
    metadata.commonGrense?.posisjonskvalitet?.maalemetode,
  ]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const oldProperties = feature.getProperties();

    feature.setProperties({
      ...oldProperties,
      metadata: getUpdatedMetadata(data, oldProperties.metadata),
    });

    updateGrenser([feature], tokenHolderFunc()?.token);
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
          <DateWrapper>
            <BlockLabel>
              Gyldig fra
              <Input type="date" role="textbox" {...register("gyldigFra")} />
            </BlockLabel>
            <BlockLabel>
              Gyldig til
              <Input type="date" role="textbox" {...register("gyldigTil")} />
            </BlockLabel>
          </DateWrapper>
        </Part>
        <Part>
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
          <BlockLabel>
            Nøyaktighet
            <Input
              type="number"
              {...register("noeyaktighet", { valueAsNumber: true })}
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
