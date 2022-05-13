import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useTheme } from "styled-components";
import {
  BlockLabel,
  Container,
  DateWrapper,
  MetadataText,
  MetadataValue,
  Part,
} from "./metadataComponents";
import useIsMetadataDisabled from "./useIsMetadataDisabled";
import useMetadataForm from "./useMetadataForm";
import { getDateInFriendlyString } from "./utils";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Select from "components/form/Select";
import useScreenWidth from "hooks/useScreenWidth";
import { Metadata, FeatureProperties } from "types/api";

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

  const screenWidth = useScreenWidth();
  const theme = useTheme();

  const disabled = useIsMetadataDisabled(properties);

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
                {...register("gyldigFra", { disabled })}
              />
            </BlockLabel>
            <BlockLabel>
              Gyldig til
              <Input
                type="date"
                role="textbox"
                {...register("gyldigTil", { disabled })}
              />
            </BlockLabel>
          </DateWrapper>
        </Part>
        <Part>
          <BlockLabel>
            Målemetode
            <Select {...register("maalemetode", { disabled })}>
              <option value="">---</option>
              {maalemetodeKoder?.map((kodeItem) => (
                <option key={kodeItem.id} value={kodeItem.id}>
                  {kodeItem.label}
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
                disabled,
                min: 0,
                max: 1_000_000,
              })}
            />
          </BlockLabel>
        </Part>
        {screenWidth < theme.dimensions.lg && (
          <Part>
            <Dates
              oppdateringsdato={metadata?.common?.oppdateringsdato}
              datafangstdato={metadata?.common?.datafangstdato}
            />
          </Part>
        )}
      </Container>
      <BlockLabel>
        Informasjon
        <Input {...register("informasjon", { disabled })} />
      </BlockLabel>
      <BlockLabel>
        Opphav
        <Input {...register("opphav", { disabled })} />
      </BlockLabel>
      {screenWidth >= theme.dimensions.lg && (
        <Part>
          <Dates
            oppdateringsdato={metadata?.common?.oppdateringsdato}
            datafangstdato={metadata?.common?.datafangstdato}
          />
        </Part>
      )}
      <Button type="submit">Lagre</Button>
    </form>
  );
};

type DatesProps = {
  oppdateringsdato?: string;
  datafangstdato?: string;
};

const Dates = ({ oppdateringsdato, datafangstdato }: DatesProps) => (
  <>
    <div>
      <MetadataText>Oppdateringsdato</MetadataText>
      <MetadataValue>
        {getDateInFriendlyString(oppdateringsdato) ?? "---"}
      </MetadataValue>
    </div>
    <div>
      <MetadataText>Datafangstdato</MetadataText>
      <MetadataValue>
        {getDateInFriendlyString(datafangstdato) ?? "---"}
      </MetadataValue>
    </div>
  </>
);

export default MetadataContent;
