import HeaderButton from "./HeaderButton";
import styled from "styled-components";

const HeaderHistoryOperations = () => {
  return (
    <Section>
      <HeaderButton
        label="Angre"
        icon="undo"
        onClick={() => console.log("TODO")}
      />
      <HeaderButton
        label="Gjør om"
        icon="redo"
        onClick={() => console.log("TODO")}
      />
      <HeaderButton
        label="Lagre"
        icon="save"
        onClick={() => console.log("TODO")}
      />
      <HeaderButton
        label="Endringslogg"
        icon="published_with_changes"
        onClick={() => console.log("TODO")}
      />
    </Section>
  );
};

const Section = styled.section`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export default HeaderHistoryOperations;
