import styled from "styled-components";
import HeaderButton from "./HeaderButton";

const HeaderUtkastOperations = () => {
  return (
    <Section>
      <HeaderButton
        label="Publiser utkast"
        icon="upload"
        onClick={() => console.log("TODO")}
      />
      <HeaderButton
        label="Slett utkast"
        icon="delete"
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

export default HeaderUtkastOperations;
