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
      <TitleWrapperButton
        icon={
          open ? (
            <CaretUpIcon aria-label="Lukk" />
          ) : (
            <CaretDownIcon aria-label="Åpne" />
          )
        }
        variant="unstyled"
        onClick={() => setOpen(!open)}
      >
        {title}
      </TitleWrapperButton>

      {open && <ChildrenWrapper>{children}</ChildrenWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 8px 0;
`;

const TitleWrapperButton = styled(Button)`
  width: 100%;
`;

const ChildrenWrapper = styled.div`
  margin: 8px 0;
`;

export default styled(Accordion)``;
