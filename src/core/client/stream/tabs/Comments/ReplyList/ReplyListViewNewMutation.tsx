import { ConnectionHandler, Environment, RecordProxy } from "relay-runtime";

import { CoralContext } from "coral-framework/lib/bootstrap";
import {
  commitLocalUpdatePromisified,
  createMutation,
} from "coral-framework/lib/relay";
import { ShowMoreRepliesEvent } from "coral-stream/events";

interface ReplyListViewNewInput {
  commentID: string;
}

const QueueViewNewMutation = createMutation(
  "viewNew",
  async (
    environment: Environment,
    input: ReplyListViewNewInput,
    { eventEmitter }: CoralContext
  ) => {
    await commitLocalUpdatePromisified(environment, async (store) => {
      const parentProxy = store.get(input.commentID);
      if (!parentProxy) {
        return;
      }
      const connectionKey = "ReplyList_replies";
      const filters = { orderBy: "CREATED_AT_ASC" };
      const connection = ConnectionHandler.getConnection(
        parentProxy,
        connectionKey,
        filters
      );
      if (!connection) {
        return;
      }
      const viewNewEdges = connection.getLinkedRecords(
        "viewNewEdges"
      ) as RecordProxy[];
      if (!viewNewEdges || viewNewEdges.length === 0) {
        return;
      }
      viewNewEdges.forEach((edge) => {
        ConnectionHandler.insertEdgeAfter(connection, edge);
      });
      connection.setLinkedRecords([], "viewNewEdges");
      ShowMoreRepliesEvent.emit(eventEmitter, {
        commentID: input.commentID,
        count: viewNewEdges.length,
      });
    });
  }
);

export default QueueViewNewMutation;
