import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";

export const ToolbarWrapper = styled(KartInteractable)`
  display: flex;
  gap: 0.5rem;
  margin-left: 30px;
  margin-top: 30px;
  border: 2px solid var(--blue);
  padding: 16px;
`;
