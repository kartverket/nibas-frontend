import { styled } from "styled-components";
import { Heading } from "@kvib/react";

export const ListHeading = styled(Heading)`
  display: flex;
  align-items: center;
  font-size: var(--kvib-fontSizes-lg);
  font-weight: 800;
  margin-bottom: 1rem;
`;

export const EndringListItem = styled.li`
  padding-left: 50px;
  margin-left: -20px;
  padding-bottom: 2rem;
  position: relative;

  &:last-child {
    padding-bottom: 0;
    margin-bottom: 2rem;
  }

  &::before {
    content: "";
    background-color: var(--kvib-colors-gray-200);
    top: 9px;
    left: 25px;
    position: absolute;
    width: 2px;
    height: 100%;
  }

  &::after {
    content: "";
    position: absolute;
    left: 19px;
    top: 9px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: var(--kvib-colors-gray-200);
  }
`;
