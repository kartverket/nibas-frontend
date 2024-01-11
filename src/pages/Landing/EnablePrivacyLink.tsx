import { Center, Flex, Link } from "@kvib/react";
import { styled } from "styled-components";

const EnablePrivacyLink = (props: React.PropsWithChildren) => {
  return (
    <Flex direction="column" height="100%">
      <FlexGrowContent>{props.children}</FlexGrowContent>

      <FooterContainer>
        <Link
          href={
            "https://kartverket.atlassian.net/wiki/spaces/NIBAS/pages/762642534/Personvernerkl+ring"
          }
          colorScheme="green"
          isExternal={true}
        >
          Personvernerklæring
        </Link>
      </FooterContainer>
    </Flex>
  );
};

const FlexGrowContent = styled.div`
  flex-grow: 1;
`;

const FooterContainer = styled(Center)`
  padding-bottom: 15px;
`;

export default EnablePrivacyLink;
