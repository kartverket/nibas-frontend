import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ApiGrense from "../../ApiGrense";
import useFylker from "hooks/inndelinger/useFylker";
import { getIdFromEntity } from "utils/api";

const FylkeList = () => {
  const { fylker, error } = useFylker();

  const { t } = useTranslation();

  if (error) {
    return <p>{t("Logg inn for å se listen")}</p>;
  }

  if (!fylker) return null;

  return (
    <Wrapper>
      {fylker.map((fylke) => (
        <ApiGrense
          key={getIdFromEntity(fylke)}
          grense={fylke}
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
