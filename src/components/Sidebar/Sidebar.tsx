import { useTranslation } from "react-i18next";
import styled from "styled-components";
import useSWR from "swr";
import SidebarButton from "./SidebarButton";
import { ReactComponent as DraftsIcon } from "icons/drafts.svg";
import { ReactComponent as InndelingerIcon } from "icons/inndelinger.svg";
import { ReactComponent as MapIcon } from "icons/map.svg";
import { ReactComponent as SearchIcon } from "icons/search.svg";
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
  const frontendVersion = process.env.REACT_APP_VERSION;

  const { t } = useTranslation();

  return (
    <StyledSidebar>
      <ButtonsWrapper>
        <SidebarButton
          title={t("sidebar.Inndelinger")}
          panel="inndelinger"
          icon={<InndelingerIcon width={36} height={36} />}
        />
        <SidebarButton
          title={t("sidebar.Søk")}
          panel="soek"
          icon={<SearchIcon width={36} height={36} />}
        />
        <SidebarButton
          title={t("sidebar.Kartlag")}
          panel="kartlag"
          icon={<MapIcon width={36} height={36} />}
        />
        <SidebarButton
          title={t("sidebar.Utkast")}
          panel="utkast"
          icon={<DraftsIcon width={36} height={36} />}
        />
      </ButtonsWrapper>

      <Versions>
        <Version>F: {frontendVersion}</Version>
        <Version>B: {backendVersion}</Version>
      </Versions>
    </StyledSidebar>
  );
};

const StyledSidebar = styled.div`
  grid-area: sidebar;
  width: 60px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-top: 80px;
`;

const ButtonsWrapper = styled.div`
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

export default Sidebar;
