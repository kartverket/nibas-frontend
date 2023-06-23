import { styled } from "styled-components";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";

const UtkastTab = () => {
  const { redigeringsmodusAktiv } = useRedigeringsmodus();
  if (!redigeringsmodusAktiv) return null;

  return (
    <Wrapper>
      <span>Redigeringsmodus</span>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: var(--yellow_dark);
  padding: 8px 16px;
  font-size: 16px;
  color: black;
`;

export default UtkastTab;
