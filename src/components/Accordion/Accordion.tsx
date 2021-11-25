import React, { useState } from "react";
import styled from "styled-components";

type Props = {
  title: React.ReactNode;
};

const Accordion: React.FC<Props> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <TitleWrapper>
        <span>{title}</span>
        <button onClick={() => setOpen(!open)}>
          {open ? "Close" : "Open"}
        </button>
      </TitleWrapper>

      {open && <ChildrenWrapper>{children}</ChildrenWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 16px 0;
`;

const TitleWrapper = styled.div`
  display: flex;

  > :first-child {
    flex: 1;
  }
`;

const ChildrenWrapper = styled.div`
  margin: 8px 0;
`;

export default Accordion;
