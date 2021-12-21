import styled from "styled-components";
import { MapInteractable } from "components/Map/MapInteractable";

export const SidebarPanel = styled(MapInteractable)`
  min-height: 400px;
  max-height: 80%;
  width: 400px;
  border: 2px solid ${({ theme }) => theme.colors.blue};
  padding: 8px 16px;
  overflow: auto;
`;
