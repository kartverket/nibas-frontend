import React, { useState } from "react";
import styled from "styled-components";
import Button from "components/Button";
import { ReactComponent as CaretDown } from "icons/caretdown.svg";
import { ReactComponent as CaretUp } from "icons/caretup.svg";

type Props = {
  title: React.ReactNode;
};

const Accordion: React.FC<Props> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <TitleWrapper>
        <span>{title}</span>
        <Button variant="unstyled" onClick={() => setOpen(!open)}>
          {open ? <CaretUp /> : <CaretDown />}
        </Button>
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
