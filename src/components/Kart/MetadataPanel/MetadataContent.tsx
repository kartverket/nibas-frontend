import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
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
        <label>
          Grensetype
          <Select disabled>
            <option>{type}</option>
          </Select>
        </label>
        <div>
          <p>Omtvisted</p>
          <Checkbox type="radio" label="Ja" disabled defaultChecked={true} />
          <Checkbox type="radio" label="Nei" disabled />
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
        <label>
          Nøyaktighetsklasse
          <Select disabled>
            <option>God</option>
          </Select>
        </label>
        <label>
          Målemetode
          <Select disabled value={metadata?.kvalitet?.maalemetode ?? ""}>
            <option value="">---</option>
            {malemetodeKoder?.map((kodeItem) => (
              <option key={kodeItem.item.uuid} value={kodeItem.item.uuid}>
                {kodeItem.item.label}
              </option>
            ))}
          </Select>
        </label>
      </Part>
      <Part>
        <p>Oppdateringsdato: {metadata?.oppdateringsdato ?? "---"}</p>
        <p>Datafangsdato: {metadata?.datafangstdato ?? "---"}</p>
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

const BlockLabel = styled.label`
  display: block;
  margin-bottom: 8px;
`;

export default MetadataContent;
