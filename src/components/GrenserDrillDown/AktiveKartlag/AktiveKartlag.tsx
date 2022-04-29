import styled from "styled-components";
import FylkeList from "../Fylkesgrenser/FylkeList";
import KommuneList from "../Kommunegrenser/KommuneList";
import useNibasApi from "hooks/useNibasApi";

const AktiveKartlag = () => {
  const { data: fylker } = useNibasApi("/v1/fylker");

  return (
    <div>
      <FylkeList onlyDisplayEditing />
      {fylker?.map((fylke) => (
        <KommuneList key={fylke.id} onlyDisplayEditing fylke={fylke} />
      ))}

      <ActiveBackgroundLayers>Aktive bakgrunnskart</ActiveBackgroundLayers>
    </div>
  );
};

const ActiveBackgroundLayers = styled.h4`
  margin: 8px 0 0;
  border-bottom: 4px solid ${({ theme }) => theme.colors.blueDark};
`;

export default AktiveKartlag;
