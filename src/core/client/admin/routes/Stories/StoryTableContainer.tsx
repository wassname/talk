import React, { FunctionComponent, useState } from "react";
import { graphql, RelayPaginationProp } from "react-relay";

import { IntersectionProvider } from "coral-framework/lib/intersection";
import {
  useLoadMore,
  useRefetch,
  withPaginationContainer,
} from "coral-framework/lib/relay";
import { GQLSTORY_STATUS_RL } from "coral-framework/schema";
import { Flex, HorizontalGutter } from "coral-ui/components/v2";

import { StoryTableContainer_query as QueryData } from "coral-admin/__generated__/StoryTableContainer_query.graphql";
import { StoryTableContainerPaginationQueryVariables } from "coral-admin/__generated__/StoryTableContainerPaginationQuery.graphql";

import SiteFilterContainer from "./SiteFilter";
import StoryTable from "./StoryTable";
import StoryTableFilter from "./StoryTableFilter";

interface Props {
  initialSearchFilter?: string;
  query: QueryData | null;
  relay: RelayPaginationProp;
}

const StoryTableContainer: FunctionComponent<Props> = (props) => {
  const stories = props.query
    ? props.query.stories.edges.map((edge) => edge.node)
    : [];

  const [loadMore, isLoadingMore] = useLoadMore(props.relay, 10);
  const [searchFilter, setSearchFilter] = useState<string>(
    props.initialSearchFilter || ""
  );
  const [statusFilter, setStatusFilter] = useState<GQLSTORY_STATUS_RL | null>(
    null
  );
  const [siteFilter, setSiteFilter] = useState<string | null>(null);
  const [, isRefetching] = useRefetch<
    Pick<
      StoryTableContainerPaginationQueryVariables,
      "searchFilter" | "statusFilter" | "siteID"
    >
  >(props.relay, {
    searchFilter: searchFilter || null,
    statusFilter,
    siteID: siteFilter,
  });

  return (
    <IntersectionProvider>
      <HorizontalGutter size="double">
        <Flex itemGutter="double">
          <StoryTableFilter
            onSetStatusFilter={setStatusFilter}
            statusFilter={statusFilter}
            onSetSearchFilter={setSearchFilter}
            searchFilter={searchFilter}
          />
          {props.query && props.query.settings.multisite && (
            <SiteFilterContainer
              query={props.query}
              siteID={siteFilter}
              onSelect={setSiteFilter}
            />
          )}
        </Flex>
        <StoryTable
          viewer={props.query && props.query.viewer}
          loading={!props.query || isRefetching}
          stories={stories}
          onLoadMore={loadMore}
          multisite={props.query ? props.query.settings.multisite : false}
          hasMore={!isRefetching && props.relay.hasMore()}
          disableLoadMore={isLoadingMore}
          isSearching={Boolean(statusFilter) || Boolean(searchFilter)}
        />
      </HorizontalGutter>
    </IntersectionProvider>
  );
};

// TODO: (cvle) In this case they are the same, but they should be autogenerated.
type FragmentVariables = StoryTableContainerPaginationQueryVariables;

const enhanced = withPaginationContainer<
  Props,
  StoryTableContainerPaginationQueryVariables,
  FragmentVariables
>(
  {
    query: graphql`
      fragment StoryTableContainer_query on Query
        @argumentDefinitions(
          count: { type: "Int!", defaultValue: 10 }
          cursor: { type: "Cursor" }
          statusFilter: { type: "STORY_STATUS" }
          searchFilter: { type: "String" }
          siteID: { type: "ID" }
        ) {
        viewer {
          ...StoryRowContainer_viewer
        }
        settings {
          multisite
        }
        ...SiteFilterContainer_query
        stories(
          first: $count
          after: $cursor
          status: $statusFilter
          query: $searchFilter
          siteID: $siteID
        ) @connection(key: "StoryTable_stories") {
          edges {
            node {
              id
              ...StoryRowContainer_story
            }
          }
        }
      }
    `,
  },
  {
    direction: "forward",
    getConnectionFromProps(props) {
      return props.query && props.query.stories;
    },
    // This is also the default implementation of `getFragmentVariables` if it isn't provided.
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        count,
        cursor,
        statusFilter: fragmentVariables.statusFilter,
        searchFilter: fragmentVariables.searchFilter,
        siteID: fragmentVariables.siteID,
      };
    },
    query: graphql`
      # Pagination query to be fetched upon calling 'loadMore'.
      # Notice that we re-use our fragment, and the shape of this query matches our fragment spec.
      query StoryTableContainerPaginationQuery(
        $count: Int!
        $cursor: Cursor
        $statusFilter: STORY_STATUS
        $searchFilter: String
        $siteID: ID
      ) {
        ...StoryTableContainer_query
          @arguments(
            count: $count
            cursor: $cursor
            statusFilter: $statusFilter
            searchFilter: $searchFilter
            siteID: $siteID
          )
      }
    `,
  }
)(StoryTableContainer);

export default enhanced;
