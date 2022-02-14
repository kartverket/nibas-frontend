import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import useMetadataFromFeature, {
  KontekstType,
  ResponseItem,
} from "./useMetadataFromFeature";
import Checkbox from "components/Checkbox";
import Input from "components/Input";
import Select from "components/Select";
import { Fylke } from "types/api";

type Props = {
  feature: Feature<Geometry>;
};

const isFylke = (
  item: ResponseItem,
  kontekstType: KontekstType
): item is Fylke => {
  return kontekstType === "FYLKE";
};

const MetadataContent = ({ feature }: Props) => {
  const { item, kontekstType } = useMetadataFromFeature(feature);

  // console.log(feature.getProperties());

  if (!item || !kontekstType) return null;

  if (isFylke(item, kontekstType)) {
    return (
      <Container>
        <Part>
          <label>
            Grensetype
            <Select disabled>
              <option>Testing</option>
            </Select>
          </label>
          <div>
            <p>Omtvisted</p>
            <Checkbox type="radio" label="Ja" disabled defaultChecked={true} />
            <Checkbox type="radio" label="Nei" disabled />
          </div>
          <BlockLabel>
            Gyldig fra
            <Input disabled defaultValue="01.04.1984" />
          </BlockLabel>
          <BlockLabel>
            Gyldig til
            <Input disabled defaultValue="01.12.2099" />
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
            <Select disabled>
              <option>Input</option>
            </Select>
          </label>
        </Part>
        <Part>
          <p>Oppdateringsdato: {"12.03.1997"}</p>
          <p>Datafangsdato: {"01.04.1979"}</p>
        </Part>
      </Container>
    );
  }

  return <div></div>;
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
