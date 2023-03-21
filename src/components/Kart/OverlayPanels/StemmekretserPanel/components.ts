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
