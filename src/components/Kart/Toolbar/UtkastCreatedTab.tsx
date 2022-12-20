import { useTranslation } from "react-i18next";
import styled from "styled-components";
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

const Wrapper = styled.div`
  background-color: var(--green);
  padding: 8px 16px;
  margin-left: 30px;
  margin-top: 16px;
  font-size: 16px;
  color: var(--white);
  width: 300px;
  box-shadow: 0 8px 6px -6px var(--gray);
`;

export default UtkastCreatedTab;
