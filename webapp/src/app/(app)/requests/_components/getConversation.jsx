// app/actions/getConversation.js
"use server";

async function getConversation(_roomId, formData, _formData2) {
  const conversations = {
    136: [
      { role: "Guest", content: "Hi, I would like to order breakfast." },
      {
        role: "Room Mitra",
        content: "Would you like to hear the breakfast menu?",
      },
      { role: "Guest", content: "Yes, what do you have?" },
      {
        role: "Room Mitra",
        content: "We have Idly vada, Masala dosa, Khara baath, and Upma.",
      },
      {
        role: "Guest",
        content: "Please get one Idly vada, two Upmas, and one Masala dosa.",
      },
      {
        role: "Room Mitra",
        content:
          "Noted. One Idly vada, two Upmas, and one Masala dosa. Shall I place the order?",
      },
      { role: "Guest", content: "Yes, go ahead." },
      {
        role: "Room Mitra",
        content: "Order placed. It will be delivered shortly.",
      },
    ],
    247: [
      { role: "Guest", content: "Hello, I need room cleaning." },
      {
        role: "Room Mitra",
        content: "Sure. Do you prefer a full service clean or quick tidy?",
      },
      { role: "Guest", content: "Full service please." },
      {
        role: "Room Mitra",
        content: "Noted. Is now a good time, or should we schedule a slot?",
      },
      { role: "Guest", content: "Now works." },
      {
        role: "Room Mitra",
        content:
          "Great. We will vacuum, dust, change linens, empty bins, and restock water and toiletries. Shall we proceed?",
      },
      { role: "Guest", content: "Yes, please proceed." },
      {
        role: "Room Mitra",
        content:
          "Assigned to housekeeping. They will arrive in about 10 to 15 minutes.",
      },
    ],
    359: [
      { role: "Guest", content: "Hi, can I get fresh towels?" },
      {
        role: "Room Mitra",
        content:
          "Certainly. How many bath towels and hand towels do you need? Do you also want a bath mat?",
      },
      {
        role: "Guest",
        content: "Two bath towels, two hand towels, and one bath mat.",
      },
      {
        role: "Room Mitra",
        content:
          "Noted. Two bath towels, two hand towels, and one bath mat for Room 359. Shall I send them now?",
      },
      { role: "Guest", content: "Yes, send now." },
      {
        role: "Room Mitra",
        content:
          "Request placed with housekeeping. Delivery in about 10 minutes.",
      },
    ],
    982: [
      { role: "Guest", content: "Good morning, I want to order breakfast." },
      {
        role: "Room Mitra",
        content:
          "Happy to help. Our breakfast includes Idly vada, Masala dosa, Poha, and Upma. What would you like?",
      },
      { role: "Guest", content: "One Masala dosa and one Idly vada." },
      {
        role: "Room Mitra",
        content:
          "Got it. One Masala dosa and one Idly vada. Shall I place the order?",
      },
      { role: "Guest", content: "Yes." },
      {
        role: "Room Mitra",
        content: "Order placed. It will be prepared soon.",
      },
    ],
  };

  return conversations?.[formData.get("roomId")] || [];
}

export default getConversation;
