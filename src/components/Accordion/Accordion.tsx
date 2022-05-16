import React, { useState } from "react";
import styled from "styled-components";
import Button from "components/form/Button";
import { ReactComponent as CaretDownIcon } from "icons/caretdown.svg";
import { ReactComponent as CaretUpIcon } from "icons/caretup.svg";

type Props = {
  title: string;
  className?: string;
  initialOpen?: boolean;
};

const Accordion: React.FC<Props> = ({
  title,
  children,
  className,
  initialOpen,
}) => {
  const [open, setOpen] = useState(initialOpen ?? false);

  return (
    <Wrapper className={className}>
      <TitleWrapperButton variant="icon" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? (
          <CaretUpIcon aria-label="Lukk" />
        ) : (
          <CaretDownIcon aria-label="Åpne" />
        )}
      </TitleWrapperButton>

      {open && <ChildrenWrapper>{children}</ChildrenWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 8px 0;
`;

const TitleWrapperButton = styled(Button)`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const ChildrenWrapper = styled.div`
  margin: 8px 0;
`;

export default styled(Accordion)``;
