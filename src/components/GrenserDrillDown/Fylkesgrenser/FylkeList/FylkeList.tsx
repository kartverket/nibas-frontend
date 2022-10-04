import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ApiGrense from "../../ApiGrense";
import { useEditGrenser } from "contexts/EditGrenserContext";
import useFylker from "hooks/inndelinger/useFylker";
import useOnlyDisplayEditingGrenser from "hooks/useOnlyDisplayEditingGrenser";

type Props = {
  onlyDisplayEditing?: boolean;
};

const FylkeList = ({ onlyDisplayEditing = false }: Props) => {
  const { fylker, error } = useFylker();

  const { values } = useEditGrenser("fylke");
  const { t } = useTranslation();

  const filteredFylker = useOnlyDisplayEditingGrenser(
    fylker,
    values,
    onlyDisplayEditing
  );

  if (error) return <p>{t("Logg inn for å se listen")}</p>;

  if (!filteredFylker) return null;

  return (
    <Wrapper>
      {filteredFylker.map((fylke) => (
        <ApiGrense
          key={fylke.id}
          grense={fylke}
          featuresUrl={`/v1/fylker/${fylke.id}/grenser`}
          type="fylke"
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default FylkeList;
