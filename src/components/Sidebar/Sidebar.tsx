import { useTranslation } from "react-i18next";
import styled from "styled-components";
import SidebarButton from "./SidebarButton";
import Icon from "components/Icon";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";

const Sidebar = () => {
  const { t } = useTranslation();
  const { redigeringsmodusAktiv } = useRedigeringsmodus();

  return (
    <StyledSidebar activeUtkast={redigeringsmodusAktiv}>
      <ButtonsWrapper>
        <SidebarButton
          title={t("sidebar.Inndelinger")}
          panel="inndelinger"
          icon={<SidebarIcon icon="space_dashboard" />}
        />
        <SidebarButton
          title={t("sidebar.Kartlag")}
          panel="kartlag"
          icon={<SidebarIcon icon="map" />}
        />
        <SidebarButton
          title={t("sidebar.Utkast")}
          panel="utkast"
          icon={<SidebarIcon icon="description" />}
        />
      </ButtonsWrapper>
    </StyledSidebar>
  );
};

const StyledSidebar = styled.div<{ activeUtkast: boolean }>`
  grid-area: sidebar;
  width: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-left: ${({ activeUtkast }) => (activeUtkast ? 6 : 0)}px;
  border-right: none;
  overflow: hidden;
`;

const ButtonsWrapper = styled.div`
  margin-right: 0px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SidebarIcon = styled(Icon)`
  font-size: 42px;
`;

export default Sidebar;
