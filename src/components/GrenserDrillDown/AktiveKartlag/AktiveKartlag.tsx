import styled from "styled-components";
import FylkeList from "../Fylkesgrenser/FylkeList";
import KommuneList from "../Kommunegrenser/KommuneList";
import MainLayer from "components/Bakgrunnskart/MainLayer";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import { BakgrunnskartId } from "hooks/layers/types";
import useNibasApi from "hooks/useNibasApi";

const AktiveKartlag = () => {
  const { data: fylker } = useNibasApi("/v1/fylker");
  const { visibleLayers } = useBakgrunnskart();

  const openLayers = Object.keys(visibleLayers).filter(
    (id) => visibleLayers[id as BakgrunnskartId]
  );

  return (
    <div>
      <FylkeList onlyDisplayEditing />
      {fylker?.map((fylke) => (
        <KommuneList key={fylke.id} onlyDisplayEditing fylke={fylke} />
      ))}

      <ActiveBackgroundLayers>Aktive bakgrunnskart</ActiveBackgroundLayers>
      {openLayers.map((id, i) => (
        <MainLayer key={id} layerId={id as BakgrunnskartId} index={i} />
      ))}
    </div>
  );
};

const ActiveBackgroundLayers = styled.h4`
  margin: 8px 0 0;
  border-bottom: 4px solid ${({ theme }) => theme.colors.blueDark};
`;

export default AktiveKartlag;
