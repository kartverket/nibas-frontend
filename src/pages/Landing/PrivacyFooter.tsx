import { Link } from "@kvib/react";
import { styled } from "styled-components";

const PrivacyFooter = () => {
  return (
    <FooterContainer>
      <Link
        href={"https://kartverket.atlassian.net/wiki/spaces/NIBAS/pages/762642534/Personvernerkl+ring"}
        colorScheme="green"
        isExternal={true}
      >
        Personvernerklæring
      </Link>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  text-align: center;
  padding-bottom: 15px;
  background: var(--kvib-colors-gray-50);
`;

export default PrivacyFooter;
