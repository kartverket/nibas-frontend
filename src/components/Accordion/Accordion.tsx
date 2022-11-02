import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import Button from "components/form/Button";
import Icon from "components/Icon";

type Props = {
  title: ReactNode;
  className?: string;
  initialOpen?: boolean;
  subButton?: ReactNode;
};

const Accordion: React.FC<Props> = ({
  title,
  children,
  className,
  initialOpen,
  subButton,
}) => {
  const [open, setOpen] = useState(initialOpen ?? false);

  return (
    <Wrapper className={className}>
      <IconSpacer>
        <NameContent>
          <Button variant="unstyled" onClick={() => setOpen(!open)}>
            {title}
          </Button>
          {subButton}
        </NameContent>
        <Button
          variant="unstyled"
          onClick={() => setOpen(!open)}
          icon={
            open ? (
              <Icon icon="expand_less" aria-label="Lukk" />
            ) : (
              <Icon icon="expand_more" aria-label="Åpne" />
            )
          }
        />
      </IconSpacer>

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

const NameContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const IconSpacer = styled.div`
  display: flex;
  width: 100%;

  > *:first-child {
    flex: 1;
  }
`;

export default styled(Accordion)``;
