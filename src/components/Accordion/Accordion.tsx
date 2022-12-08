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
  background: ${({ open, theme }) =>
    open ? theme.colors.blueLight : theme.colors.white};
  padding: 16px 0;
  padding-left: 16px;
  border-left: 3px solid
    ${({ theme, open }) => (open ? theme.colors.blueDark : "transparent")};
  width: 100%;
`;

const CaretIcon = styled(Icon)<{ open: boolean }>`
  height: 100%;
  background: ${({ open, theme }) =>
    open ? theme.colors.blueDark : theme.colors.white};
  color: ${({ open, theme }) =>
    open ? theme.colors.white : theme.colors.blueDark};
  height: 100%;
  padding: 16px 12px;
  align-items: center;
  display: flex;
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
      background: ${({ theme }) => theme.colors.blueDark};
      transition: background 0ms;
      color: ${({ theme }) => theme.colors.white};
    }

    ${NameContent} {
      background: ${({ theme }) => theme.colors.blueLight};
      transition: background 0.1s;
    }
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.blueDark};
    outline-offset: 2px;
  }

  > :first-child {
    width: 100%;
  }
`;

export default styled(Accordion)``;
