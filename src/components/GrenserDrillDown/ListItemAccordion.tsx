import { ReactNode, useState } from "react";
import { styled } from "styled-components";
import { Outline } from "style/mixins";
import { Icon } from "@kvib/react";

type Props = {
  title: ReactNode;
  className?: string;
  initialOpen?: boolean;
  subButton?: ReactNode;
  children?: ReactNode;
};

const ListItemAccordion = ({ title, children, className, initialOpen, subButton }: Props) => {
  const [open, setOpen] = useState(initialOpen ?? false);

  return (
    <Wrapper className={className}>
      <ButtonWrapper onClick={() => setOpen(!open)}>
        <DropDown>
          <NameContent $isOpen={open}>
            {title}
            {subButton}
          </NameContent>
          {open ? (
            <CaretIcon $isOpen={open} icon="expand_less" aria-label={`Lukk ${title}`} />
          ) : (
            <CaretIcon $isOpen={open} icon="expand_more" aria-label={`Åpne ${title}`} />
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
  text-align: left;
`;

const NameContent = styled.div<{ $isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${({ $isOpen }) => ($isOpen ? "var(--kvib-colors-blue-50)" : "var(--kvib-colors-chakra-body-bg)")};
  padding: 16px 0;
  padding-left: 16px;
  border-left: 3px solid ${({ $isOpen }) => ($isOpen ? "var(--kvib-colors-blue-500)" : "transparent")};
  width: 100%;
  transition: background 0.1s;
`;

const CaretIcon = styled(Icon)<{ $isOpen: boolean }>`
  height: 100%;
  background: ${({ $isOpen }) => ($isOpen ? "var(--kvib-colors-blue-500)" : "var(--kvib-colors-chakra-body-bg)")};
  color: ${({ $isOpen }) => ($isOpen ? "var(--kvib-colors-chakra-inverse-text)" : "var(--kvib-colors-blue-500)")};
  padding: 16px 12px;
  align-items: center;
  display: flex;
  transition: background 0.1s;
`;

const Wrapper = styled.li`
  margin: 8px 0;
`;

const ChildrenWrapper = styled.div`
  margin: 8px 0;
  padding-left: 24px;
`;

const ButtonWrapper = styled.button`
  display: flex;
  width: 100%;
  flex-direction: column;

  &:hover {
    ${CaretIcon} {
      background: var(--kvib-colors-blue-500);
      color: var(--kvib-colors-chakra-inverse-text);
    }

    ${NameContent} {
      background: var(--kvib-colors-blue-50);
    }
  }

  &:focus-visible {
    ${Outline};
  }

  > :first-child {
    width: 100%;
  }
`;

export default ListItemAccordion;
