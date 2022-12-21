import { useTranslation } from "react-i18next";
import styled, { keyframes } from "styled-components";
import Icon from "components/Icon";

const UtkastCreatedTab = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Icon icon="check" />
      <span>{t("Utkastet er opprettet")}</span>
    </Wrapper>
  );
};

const fadeInFadeOutFromTop = keyframes`
  0% {
    opacity: 0;
    margin-top: 0px;
  }
  15% {
    opacity: 1;
    margin-top: 16px;
  } 
  80% {
    opacity: 1;
    margin-top: 16px;
  }
  100% {
    opacity: 0;
    margin-top: 16px;
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--green);
  padding: 16px;
  margin-left: 30px;
  font-size: 16px;
  color: var(--white);
  width: calc(100% - 30px);
  box-shadow: 0 8px 6px -6px var(--gray);
  gap: 12px;
  opacity: 0;

  animation: ${fadeInFadeOutFromTop} 5s ease-in-out;
`;

export default UtkastCreatedTab;
