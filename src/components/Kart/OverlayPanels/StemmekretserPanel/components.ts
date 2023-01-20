import styled from "styled-components";

export const Section = styled.div`
  background-color: var(--gray_light);
  padding: 30px 24px;
`;

export const ContrastSection = styled(Section)`
  background: var(--green_light);
  border: 2px solid var(--black);
  border-left: none;
  border-right: none;
`;

export const BlockLabel = styled.label`
  input {
    width: 100%;
  }

  margin-bottom: 16px;
`;

export const InputsWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: 80%;

  > ${BlockLabel} {
    width: 100%;

    &:first-child {
      flex: 1;
    }

    &:last-child {
      flex: 3;
    }
  }
`;
