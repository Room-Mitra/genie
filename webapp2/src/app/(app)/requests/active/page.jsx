import ConversationModal from "../_components/conversationModal";
import getConversation from "../_components/getConversation";
import SortTable from "@/components/ui/sort-table";
import RequestStatus from "../_components/requestStatus";

export default async function Page() {
  const columns = [
    { key: "time", label: "TIME" },
    { key: "status", label: "STATUS" },
    { key: "roomNumber", label: "ROOM NUMBER" },
    { key: "category", label: "CATEGORY" },
    { key: "summary", label: "SUMMARY" },

    { key: "viewConversation", label: "VIEW CONVERSATION", sortable: false },
    { key: "acknowledge", label: "ACKNOWLEDGE", sortable: false },
  ];

  const data = [
    {
      time: "10:00 AM",
      roomNumber: "136",
      category: "Room Service",
      summary: "Breakfast",
      status: <RequestStatus status={"Unacknowledged"} />,
      viewConversation: (
        <ConversationModal getConversation={getConversation} roomId={136} />
      ),
      acknowledge: acknowledge("136"),
    },
    {
      time: "10:10 AM",
      roomNumber: "247",
      category: "Housekeeping",
      summary: "Room Cleaning",
      status: <RequestStatus status={"Unacknowledged"} />,
      viewConversation: (
        <ConversationModal getConversation={getConversation} roomId={247} />
      ),
      acknowledge: acknowledge("247"),
    },

    {
      time: "10:15 AM",
      roomNumber: "359",
      category: "Housekeeping",
      summary: "Fresh towels",
      status: <RequestStatus status={"In Progress"} />,
      viewConversation: (
        <ConversationModal getConversation={getConversation} roomId={359} />
      ),
      acknowledge: acknowledge("359"),
    },
    {
      time: "9:45 AM",
      roomNumber: "982",
      category: "Room Service",
      summary: "Breakfast",
      status: <RequestStatus status={"Delayed"} />,
      viewConversation: (
        <ConversationModal getConversation={getConversation} roomId={982} />
      ),
      acknowledge: acknowledge("982"),
    },
  ];

  function acknowledge(a) {
    return async () => {
      "use server";
      console.log("acknowledge", a);
    };
  }

  return (
    <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Active Requests
      </h2>

      <SortTable
        columns={columns}
        data={data}
        tableRowClassNames={["text-base font-medium text-dark dark:text-white"]}
      />
    </div>
  );
}
