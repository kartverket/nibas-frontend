import { useTranslation } from "react-i18next";
import styled from "styled-components";
import SidebarButton from "./SidebarButton";
import { ReactComponent as DraftsIcon } from "icons/drafts.svg";
import { ReactComponent as InndelingerIcon } from "icons/inndelinger.svg";
import { ReactComponent as MapIcon } from "icons/map.svg";
import { ReactComponent as SearchIcon } from "icons/search.svg";

const Sidebar = () => {
  const { t } = useTranslation();

  return (
    <StyledSidebar>
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
  margin-top: 80px;
`;

export default Sidebar;
