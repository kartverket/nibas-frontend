import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import Button from "components/form/Button";
import Icon from "components/Icon";
import { Outline } from "style/mixins";

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
      <ButtonWrapper onClick={() => setOpen(!open)}>
        <DropDown>
          <NameContent open={open}>
            {title}
            {subButton}
          </NameContent>
          {open ? (
            <CaretIcon
              open={open}
              icon="expand_less"
              aria-label={`Lukk ${title}`}
            />
          ) : (
            <CaretIcon
              open={open}
              icon="expand_more"
              aria-label={`Åpne ${title}`}
            />
          )}
        </DropDown>
      </ButtonWrapper>

      {open && <ChildrenWrapper>{children}</ChildrenWrapper>}
    </Wrapper>
  );
};

const DropDown = styled.div`
  display: flex;
  justify-content: space-between;
`;

const NameContent = styled.div<{ open: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${({ open }) => (open ? "var(--blue_light)" : "var(--white)")};
  padding: 16px 0;
  padding-left: 16px;
  border-left: 3px solid
    ${({ open }) => (open ? "var(--blue_dark)" : "transparent")};
  width: 100%;
  transition: background 0.1s;
`;

const CaretIcon = styled(Icon)<{ open: boolean }>`
  height: 100%;
  background: ${({ open }) => (open ? "var(--blue_dark)" : "var(--white)")};
  color: ${({ open }) => (open ? "var(--white)" : "var(--blue_dark)")};
  height: 100%;
  padding: 16px 12px;
  align-items: center;
  display: flex;
  transition: background 0.1s;
`;

const Wrapper = styled.div`
  margin: 8px 0;
`;

const ChildrenWrapper = styled.div`
  margin: 8px 0;
  padding-left: 24px;
`;

const ButtonWrapper = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
  display: flex;
  width: 100%;
  flex-direction: column;

  &:hover {
    ${CaretIcon} {
      background: var(--blue_dark);
      color: var(--white);
    }

    ${NameContent} {
      background: var(--blue_light);
    }
  }

  &:focus-visible {
    ${Outline}
  }

  > :first-child {
    width: 100%;
  }
`;

export default styled(Accordion)``;
