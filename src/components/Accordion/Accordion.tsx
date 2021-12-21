import React, { useState } from "react";
import styled from "styled-components";
import Button from "components/Button";
import { ReactComponent as CaretDownIcon } from "icons/caretdown.svg";
import { ReactComponent as CaretUpIcon } from "icons/caretup.svg";

type Props = {
  title: string;
};

const Accordion: React.FC<Props> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <TitleWrapper variant="icon" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? (
          <CaretUpIcon aria-label={`Lukk ${title}`} />
        ) : (
          <CaretDownIcon aria-label={`Åpne ${title}`} />
        )}
      </TitleWrapper>

      {open && <ChildrenWrapper>{children}</ChildrenWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 8px 0;
`;

const TitleWrapper = styled(Button)`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const ChildrenWrapper = styled.div`
  margin: 8px 0;
`;

export default Accordion;
