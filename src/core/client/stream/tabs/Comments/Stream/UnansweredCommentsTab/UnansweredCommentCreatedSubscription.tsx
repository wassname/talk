import { graphql } from "react-relay";
import {
  ConnectionHandler,
  Environment,
  RecordProxy,
  RecordSourceSelectorProxy,
} from "relay-runtime";

import {
  createSubscription,
  requestSubscription,
  SubscriptionVariables,
} from "coral-framework/lib/relay";
import { GQLCOMMENT_SORT, GQLCOMMENT_SORT_RL } from "coral-framework/schema";

import { UnansweredCommentCreatedSubscription } from "coral-stream/__generated__/UnansweredCommentCreatedSubscription.graphql";

function updateForNewestFirst(
  store: RecordSourceSelectorProxy<unknown>,
  storyID: string
) {
  const rootField = store.getRootField("commentCreated");
  if (!rootField) {
    return;
  }
  const comment = rootField.getLinkedRecord("comment")!;
  comment.setValue(true, "enteredLive");
  const commentsEdge = store.create(
    `edge-${comment.getValue("id")!}`,
    "CommentsEdge"
  );
  commentsEdge.setValue(comment.getValue("createdAt"), "cursor");
  commentsEdge.setLinkedRecord(comment, "node");
  const story = store.get(storyID)!;
  const connection = ConnectionHandler.getConnection(story, "Stream_comments", {
    orderBy: GQLCOMMENT_SORT.CREATED_AT_DESC,
  })!;
  const linked = connection.getLinkedRecords("viewNewEdges") || [];
  connection.setLinkedRecords(linked.concat(commentsEdge), "viewNewEdges");
}

function updateForOldestFirst(
  store: RecordSourceSelectorProxy<unknown>,
  storyID: string
) {
  const story = store.get(storyID)!;
  const connection = ConnectionHandler.getConnection(story, "Stream_comments", {
    orderBy: GQLCOMMENT_SORT.CREATED_AT_ASC,
  })!;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const pageInfo = connection.getLinkedRecord("pageInfo") as RecordProxy;
  pageInfo.setValue(true, "hasNextPage");
}

const UnansweredCommentCreatedSubscription = createSubscription(
  "subscribeToUnansweredCommentCreated",
  (
    environment: Environment,
    variables: SubscriptionVariables<UnansweredCommentCreatedSubscription> & {
      orderBy: GQLCOMMENT_SORT_RL;
    }
  ) =>
    requestSubscription(environment, {
      subscription: graphql`
        subscription UnansweredCommentCreatedSubscription($storyID: ID!) {
          commentCreated(storyID: $storyID) {
            comment {
              id
              createdAt
              ...UnansweredCommentsTabContainer_comment
            }
          }
        }
      `,
      variables,
      updater: (store) => {
        const rootField = store.getRootField("commentCreated");
        if (!rootField) {
          return;
        }
        const commentID = rootField
          .getLinkedRecord("comment")!
          .getValue("id")! as string;
        const commentInStore = Boolean(
          // We use store from environment here, because it does not contain the response data yet!
          environment.getStore().getSource().get(commentID)
        );
        if (commentInStore) {
          // Comment already in the queue, ignore it as it might be just expected race condition,
          // unless the server is sending the same response multiple times.
          return;
        }

        if (variables.orderBy === GQLCOMMENT_SORT.CREATED_AT_DESC) {
          updateForNewestFirst(store, variables.storyID);
          return;
        }
        if (variables.orderBy === GQLCOMMENT_SORT.CREATED_AT_ASC) {
          updateForOldestFirst(store, variables.storyID);
          return;
        }
        throw new Error(
          `Unsupport new top level comment live updates for sort ${variables.orderBy}`
        );
      },
    })
);

export default UnansweredCommentCreatedSubscription;
