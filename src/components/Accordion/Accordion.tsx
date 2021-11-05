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
      {open && children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  /* display: flex; */
`;

const TitleWrapper = styled.div`
  display: flex;

  > :first-child {
    flex: 1;
  }
`;

export default Accordion;
