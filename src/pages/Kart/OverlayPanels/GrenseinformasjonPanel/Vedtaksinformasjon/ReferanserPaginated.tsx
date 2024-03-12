import { IconButton, Text } from "@kvib/react";
import { FormViewState, Referanse } from "./Vedtaksinformasjon";
import { ReferanseCard } from "./ReferanseCard";
import { useState } from "react";
import { ReferanseCardWrapper } from "./VedtaksinfoBody";
import { styled } from "styled-components";
import { createUniqueIshValue } from "./util/vedtaksinfoHelperMethods";

type ReferanserPaginatedProps = {
  deleteRef: (index: number) => void;
  referanser: Referanse[] | undefined;
  urlMode: boolean;
  formViewState: FormViewState;
};

export const ReferanserPaginated = ({ referanser, urlMode, deleteRef, formViewState }: ReferanserPaginatedProps) => {
  const [page, setPage] = useState(0);
  const pageSize = formViewState === "viewing" ? 4 : 3;
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
                key={createUniqueIshValue(10)}
                referanse={ref}
                urlMode={urlMode}
                formViewState={formViewState}
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
            isDisabled={page === 0}
            onClick={() => {
              if (page <= 0) return;
              setPage(page - 1);
            }}
          >
            left
          </IconButton>
          <Text marginLeft="10px" marginRight="10px">
            Side {page + 1} av {numberOfPages}
          </Text>
          <IconButton
            width="24px"
            height="24px"
            aria-label="Neste side"
            variant="secondary"
            size="xs"
            icon="chevron_right"
            isDisabled={page === numberOfPages - 1}
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

const ReferanseItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
`;

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
