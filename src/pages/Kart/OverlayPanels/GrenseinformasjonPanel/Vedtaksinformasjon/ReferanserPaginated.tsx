import { IconButton, Text } from "@kvib/react";
import { Referanse } from "./OversiktVedtaksinfo";
import { ReferanseCard } from "./ReferanseCard";
import { useState } from "react";
import { ReferanseItemsContainer, ReferanseCardWrapper } from "./VedtaksinfoBody";
import { styled } from "styled-components";

type ReferanserPaginatedProps = {
  deleteRef: (index: number) => void;
  referanser: Referanse[] | undefined;
  displayMode: boolean;
  urlMode: boolean;
};

export const ReferanserPaginated = ({ referanser, urlMode, displayMode, deleteRef }: ReferanserPaginatedProps) => {
  const [page, setPage] = useState(0);
  const pageSize = displayMode ? 4 : 3;
  const startIndex = page * pageSize;
  const refCopy = structuredClone(referanser);
  const itemsToShow = refCopy?.splice(startIndex, pageSize);
  const numberOfPages = referanser && referanser.length > 0 ? Math.ceil(referanser.length / pageSize) : 1;

  return (
    <ReferanseItemsContainer>
      <ReferanseCardWrapper>
        {itemsToShow && itemsToShow.length > 0
          ? itemsToShow?.map((ref: Referanse, index: number) => (
              <ReferanseCard
                key={ref.beskrivelse}
                referanse={ref}
                urlMode={urlMode}
                displayMode={displayMode}
                deleteRef={() => {
                  deleteRef(page * pageSize + index);
                }}
              />
            ))
          : "Det finnes ingen dokumenter for denne referansen"}
      </ReferanseCardWrapper>
      <PaginationRow>
        <PaginationControls>
          <IconButton
            aria-label="Forrige side"
            variant="secondary"
            size="xs"
            icon="chevron_left"
            width="24px"
            height="24px"
            onClick={() => {
              if (page <= 0) return;
              setPage(page - 1);
            }}
          >
            left
          </IconButton>
          <Text marginLeft={"10px"} marginRight={"10px"}>
            Side {page + 1} av {numberOfPages}
          </Text>
          <IconButton
            width="24px"
            height="24px"
            aria-label="Neste side"
            variant="secondary"
            size="xs"
            icon="chevron_right"
            onClick={() => {
              if (page + 1 >= numberOfPages) return;
              setPage(page + 1);
            }}
          >
            right
          </IconButton>
        </PaginationControls>
      </PaginationRow>
    </ReferanseItemsContainer>
  );
};

const PaginationControls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const PaginationRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 10px;
`;
