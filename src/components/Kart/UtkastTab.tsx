import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useUtkast } from "contexts/UtkastContext";

const UtkastTab = () => {
  const { t } = useTranslation();
  const { utkast } = useUtkast();

  if (!utkast) return null;

  return (
    <Wrapper>
      <span>{t("Redigeringsmodus")}</span>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: absolute;
  top: -36px;
  height: 36px;
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
