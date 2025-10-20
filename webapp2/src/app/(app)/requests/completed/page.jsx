import ConversationModal from "../_components/conversationModal";
import getConversation from "../_components/getConversation";
import SortTable from "@/components/ui/sort-table";
import RequestStatus from "../_components/requestStatus";

export default async function Page() {
  const columns = [
    { key: "requestedAt", label: "REQUESTED AT" },
    { key: "status", label: "STATUS" },
    { key: "completedAt", label: "COMPLETED AT" },
    { key: "roomNumber", label: "ROOM NUMBER" },
    { key: "category", label: "CATEGORY" },
    { key: "summary", label: "SUMMARY" },
    { key: "viewConversation", label: "VIEW CONVERSATION", sortable: false },
  ];

  const data = [
    {
      requestedAt: "10:00 AM",
      completedAt: "10:30 AM",
      roomNumber: "136",
      category: "Room Service",
      summary: "Breakfast",
      status: <RequestStatus status={"Completed"} />,
      viewConversation: (
        <ConversationModal getConversation={getConversation} roomId={136} />
      ),
    },
    {
      requestedAt: "10:10 AM",
      completedAt: "10:30 AM",
      roomNumber: "247",
      category: "Housekeeping",
      summary: "Room Cleaning",
      status: <RequestStatus status={"Completed"} />,
      viewConversation: (
        <ConversationModal getConversation={getConversation} roomId={247} />
      ),
    },

    {
      requestedAt: "10:15 AM",
      completedAt: "10:30 AM",
      roomNumber: "359",
      category: "Housekeeping",
      summary: "Fresh towels",
      status: <RequestStatus status={"Completed"} />,
      viewConversation: (
        <ConversationModal getConversation={getConversation} roomId={359} />
      ),
    },
    {
      requestedAt: "9:45 AM",
      completedAt: "10:30 AM",
      roomNumber: "982",
      category: "Room Service",
      summary: "Breakfast",
      status: <RequestStatus status={"Completed"} />,
      viewConversation: (
        <ConversationModal getConversation={getConversation} roomId={982} />
      ),
    },
  ];



  return (
    <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Completed Requests
      </h2>

      <SortTable
        columns={columns}
        data={data}
        tableRowClassNames={["text-base font-medium text-dark dark:text-white"]}
      />
    </div>
  );
}
