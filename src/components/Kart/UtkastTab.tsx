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

const tabHeight = 36;

const Wrapper = styled.div`
  position: absolute;
  top: -${tabHeight}px;
  height: ${tabHeight}px;
  left: 60%;
  width: auto;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.redDark};
  padding: 0 16px;
  font-size: 16px;
  color: white;
`;

export default UtkastTab;
