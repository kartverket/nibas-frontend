import styled from "styled-components";
import { KartInteractable } from "components/Kart/KartInteractable";

export const SidebarPanel = styled(KartInteractable)`
  min-height: 400px;
  max-height: 80%;
  width: 440px;
  border: 2px solid var(--blue);
  padding: 8px 16px;
  overflow: auto;
`;
