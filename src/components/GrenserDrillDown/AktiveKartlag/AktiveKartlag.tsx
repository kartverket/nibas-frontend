import { useTranslation } from "react-i18next";
import styled from "styled-components";
import FylkeList from "../Fylkesgrenser/FylkeList";
import KommuneList from "../Kommunegrenser/KommuneList";
import MainLayer from "components/Bakgrunnskart/MainLayer";
import Heading from "components/typography/Heading";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import useFylker from "hooks/inndelinger/useFylker";
import { BakgrunnskartId } from "hooks/layers/types";

const AktiveKartlag = () => {
  const { t } = useTranslation();
  const { fylker } = useFylker();
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

      <ActiveBackgroundLayers tag="h3" size="xs">
        {t("Aktive bakgrunnskart")}
      </ActiveBackgroundLayers>
      {openLayers.map((id, i) => (
        <MainLayer
          key={id}
          layerId={id as BakgrunnskartId}
          index={i}
          canDrag={false}
        />
      ))}
    </div>
  );
};

const ActiveBackgroundLayers = styled(Heading)`
  margin: 8px 0 0;
  border-bottom: 4px solid ${({ theme }) => theme.colors.blueDark};
`;

export default AktiveKartlag;
