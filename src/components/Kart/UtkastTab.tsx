import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";

const UtkastTab = () => {
  const { t } = useTranslation();
  const { redigeringsmodusAktiv } = useRedigeringsmodus();

  if (!redigeringsmodusAktiv) return null;

  return (
    <Wrapper>
      <span>{t("Redigeringsmodus")}</span>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: var(--yellow_dark);
  padding: 8px 16px;
  font-size: 16px;
  color: black;
  z-index: 1;
`;

export default UtkastTab;
