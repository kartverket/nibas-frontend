import styled from "styled-components";
import { KartInteractable } from "components/Kart/KartInteractable";

export const SidebarPanel = styled(KartInteractable)`
  min-height: 400px;
  max-height: 80%;
  width: 400px;
  border: 2px solid ${({ theme }) => theme.colors.blue};
  padding: 8px 16px;
  overflow: auto;
`;
