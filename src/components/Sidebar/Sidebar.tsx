import { useTranslation } from "react-i18next";
import styled from "styled-components";
import useSWR from "swr";
import SidebarButton from "./SidebarButton";
import Icon from "components/Icon";
import { useUtkast } from "contexts/UtkastContext";
import { fetcher } from "utils/swr";

type ActuatorResponse = {
  application: {
    version: string;
  };
};

const Sidebar = () => {
  const { data: actuator } = useSWR<ActuatorResponse>(
    "/actuator/info",
    fetcher
  );
  const backendVersion = actuator?.application.version ?? "---";
  const frontendVersion = process.env.REACT_APP_VERSION ?? "VERSION-NOT-SET";

  const { t } = useTranslation();

  const { redigeringsmodus } = useUtkast();

  return (
    <StyledSidebar utkastActive={redigeringsmodus}>
      <ButtonsWrapper>
        <SidebarButton
          title={t("sidebar.Inndelinger")}
          panel="inndelinger"
          icon={<SidebarIcon icon="space_dashboard" />}
        />
        <SidebarButton
          title={t("sidebar.Søk")}
          panel="soek"
          icon={<SidebarIcon icon="search" />}
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

      <Versions>
        <Version>F: {frontendVersion}</Version>
        <Version>B: {backendVersion}</Version>
      </Versions>
    </StyledSidebar>
  );
};

const StyledSidebar = styled.div<{ utkastActive: boolean }>`
  grid-area: sidebar;
  width: 80px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-top: 80px;

  border: 3px solid
    ${({ theme, utkastActive }) =>
      utkastActive ? theme.colors.redDark : "transparent"};
  border-right: none;
`;

const ButtonsWrapper = styled.div`
  margin-left: -6px;
  margin-right: 0px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Versions = styled.div`
  text-align: center;
`;

const Version = styled.p`
  margin: 8px 0;
  font-size: 12px;
`;

const SidebarIcon = styled(Icon)`
  font-size: 42px;
`;

export default Sidebar;
