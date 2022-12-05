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
  top: 14px;
  height: ${tabHeight}px;
  right: 17px;
  width: auto;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.yellowLight};
  border: 2px solid #ffbf00;
  padding: 0 16px;
  font-size: 16px;
  color: black;
  z-index: 9;
`;

export default UtkastTab;
