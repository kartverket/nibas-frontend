import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled, { css } from "styled-components";
import useSWR from "swr";
import { KodelisteItem } from "api/kodelister";
import Input from "components/Input";
import Select from "components/Select";
import { fetcher } from "utils/swr";

type Props = {
  feature: Feature<Geometry>;
};

const MetadataContent = ({ feature }: Props) => {
  const { data: maalemetodeKoder } = useSWR<KodelisteItem[]>(
    "/v1/kodeliste/maalemetode-koder",
    fetcher
  );

  const properties = feature.getProperties();
  const type = properties.type;
  const metadata = properties.metadata;

  return (
    <div>
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
            <Select
              disabled
              value={metadata?.common?.posisjonskvalitet?.maalemetode ?? ""}
            >
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
              {metadata?.common?.oppdateringsdato ?? "---"}
            </MetadataValue>
          </div>
          <div>
            <MetadataText>Datafangsdato</MetadataText>
            <MetadataValue>
              {metadata?.common?.datafangstdato ?? "---"}
            </MetadataValue>
          </div>
        </Part>
      </Container>
      <BlockLabel>
        Informasjon
        <Input
          disabled
          defaultValue={metadata?.common?.informasjonselementer[0] ?? "---"}
        />
      </BlockLabel>
      <BlockLabel>
        Opphav
        <Input disabled defaultValue={metadata?.common?.opphav ?? "---"} />
      </BlockLabel>
    </div>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const Part = styled.div`
  flex: 1;
  max-width: 350px;
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
