import React from "react";
import styled from "styled-components";
import Button from "components/Button";
import { ReactComponent as CaretLeft } from "icons/cog.svg";

type Props = {
  closePanel: () => void;
};

const SidebarPanelTitle: React.FC<Props> = ({ children, closePanel }) => {
  return (
    <TitleWrapper>
      <StyledTitle>{children}</StyledTitle>
      <CloseButton variant="icon" onClick={closePanel}>
        <CaretLeft />
      </CloseButton>
    </TitleWrapper>
  );
};

const TitleWrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 16px;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitle = styled.h3`
  margin: 0;
`;

const CloseButton = styled(Button)``;

export default SidebarPanelTitle;
