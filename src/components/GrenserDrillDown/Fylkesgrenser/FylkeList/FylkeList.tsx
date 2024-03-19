import { styled } from "styled-components";
import ToggleableAdministrativEnhet from "../../ToggleableAdministrativEnhet/ToggleableAdministrativEnhet";
import useFylker from "hooks/inndelinger/useFylker";
import { getIdFromEntity } from "utils/api";

const FylkeList = () => {
  const { fylker, error } = useFylker();

  if (error != null) {
    return <p>Logg inn for å se listen</p>;
  }

  if (!fylker) return null;

  return (
    <Wrapper>
      {fylker.map((fylke) => (
        <ToggleableAdministrativEnhet
          key={getIdFromEntity(fylke)}
          administrativEnhet={fylke}
          featuresUrl={`/v1/fylker/${getIdFromEntity(fylke)}/grenser`}
          type="fylke"
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 24px;
`;

export default FylkeList;
