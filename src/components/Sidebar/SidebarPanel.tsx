import styled from "styled-components";
import { KartInteractable } from "components/Kart/KartInteractable";

export const SidebarPanel = styled(KartInteractable)`
  height: 100%;
  width: 100%;
  padding: 8px 16px;
  border-right: 3px solid var(--gray_light);
  overflow: auto;
`;
