import React, { useState } from "react";
import styled from "styled-components";
import Button from "components/form/Button";
import Icon from "components/Icon";

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
      <TitleWrapperButton variant="unstyled" onClick={() => setOpen(!open)}>
        <IconSpacer>
          <span>{title}</span>
          {open ? (
            <Icon icon="expand_less" aria-label="Lukk" />
          ) : (
            <Icon icon="expand_more" aria-label="Åpne" />
          )}
        </IconSpacer>
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

const IconSpacer = styled.div`
  display: flex;
  width: 100%;

  > *:first-child {
    flex: 1;
  }
`;

export default styled(Accordion)``;
