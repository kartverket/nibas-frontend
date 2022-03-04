import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled, { css } from "styled-components";
import useSWR from "swr";
import { KodelisteItem } from "api/kodelister";
import Checkbox from "components/Checkbox";
import Input from "components/Input";
import Select from "components/Select";
import { fetcher } from "utils/swr";

type Props = {
  feature: Feature<Geometry>;
};

const MetadataContent = ({ feature }: Props) => {
  const { data: malemetodeKoder } = useSWR<KodelisteItem[]>(
    "/v1/kodeliste/malemetode-koder",
    fetcher
  );

  const { type, metadata } = feature.getProperties();

  return (
    <Container>
      <Part>
        <BlockLabel>
          Grensetype
          <Select disabled>
            <option>{type}</option>
          </Select>
        </BlockLabel>
        <div>
          <MetadataText>Omtvisted</MetadataText>
          <Checkbox
            type="radio"
            label={<MetadataText>Ja</MetadataText>}
            disabled
            defaultChecked={metadata?.omtvistet}
          />
          <Checkbox
            type="radio"
            label={<MetadataText>Nei</MetadataText>}
            disabled
            defaultChecked={!metadata?.omtvistet}
          />
        </div>
        <BlockLabel>
          Gyldig fra
          <Input disabled defaultValue={metadata?.gyldigFra ?? "---"} />
        </BlockLabel>
        <BlockLabel>
          Gyldig til
          <Input disabled defaultValue={metadata?.gyldigTil ?? "---"} />
        </BlockLabel>
      </Part>
      <Part>
        <BlockLabel>
          Nøyaktighetsklasse
          <Select disabled>
            <option>Mangler kodeliste</option>
          </Select>
        </BlockLabel>
        <BlockLabel>
          Målemetode
          <Select disabled value={metadata?.kvalitet?.maalemetode ?? ""}>
            <option value="">---</option>
            {malemetodeKoder?.map((kodeItem) => (
              <option key={kodeItem.item.uuid} value={kodeItem.item.uuid}>
                {kodeItem.item.label}
              </option>
            ))}
          </Select>
        </BlockLabel>
      </Part>
      <Part>
        <div>
          <MetadataText>Oppdateringsdato</MetadataText>
          <MetadataValue>{metadata?.oppdateringsdato ?? "---"}</MetadataValue>
        </div>
        <div>
          <MetadataText>Datafangsdato</MetadataText>
          <MetadataValue>{metadata?.datafangstdato ?? "---"}</MetadataValue>
        </div>
      </Part>
    </Container>
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
