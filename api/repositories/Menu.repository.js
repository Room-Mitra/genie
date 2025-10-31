// // Item (one per menu entry)
// {
//   "pk": "MENU#<hotelId>#ITEM#<itemId>",
//   "sk": "ITEM#<itemId>",
//   "hotelMenu_pk": "MENU#<hotelId>",
//   "hotelMenu_sk": "SECTION#<section>#ITEM#<itemId>",

//   "hotelId": "<hotelId>",
//   "itemId": "<ulid>",
//   "section": "Breakfast",
//   "name": "Paneer Parantha",
//   "description": "Whole wheat, butter, pickle",
//   "tags": ["indian", "veg", "paneer", "breakfast"],
//   "unitPrice": "220.00",
//   "dietary": { "veg": true, "vegan": false, "glutenFree": false },
//   "imageUrl": "https://…",
//   "available": true,
//   "menuVersion": "sha256:…",           // same version for all items of a menu snapshot
//   "embedding_v1": "<base64-f32-1536>"  // optional, for semantic ranking
// }

// repo/MenuRepo.ts
// const ddb = new DynamoDBClient({});
// const ENTITY_TABLE = process.env.ENTITY_TABLE!;
// const GSI_MenuByHotel = process.env.GSI_MENU_BY_HOTEL!; // GSI_MenuByHotel

// export type MenuItem = {
//   hotelId: string;
//   itemId: string;
//   section: string;
//   name: string;
//   description?: string;
//   tags?: string[];
//   unitPrice: string;
//   dietary?: { veg?: boolean; vegan?: boolean; glutenFree?: boolean };
//   imageUrl?: string;
//   available?: boolean;
//   menuVersion?: string;
//   embedding_v1?: string; // base64 Float32Array
// };

const menu = {
  sections: [
    {
      name: 'Soups',
      items: [
        {
          name: 'Pumpkin Soup',
          unitPrice: '160.00',
          image: {
            url: 'http://example.com/images/pumpkin-soup.jpg',
          },
          itemId: '01K86CSPCX2X87HF774B1RN5PY',
        },
        {
          name: 'Lemon Coriander Soup',
          unitPrice: '180.00',
          image: {
            url: 'http://example.com/images/lemon-coriander-soup.jpg',
          },
          itemId: '01K86CSPCY0MPKARAD7Y09E3NG',
        },
        {
          name: 'Cream of Broccoli',
          unitPrice: '190.00',
          image: {
            url: 'http://example.com/images/cream-of-broccoli.jpg',
          },
          itemId: '01K86CSPCZ1MZ8DA1NMRPNDXD8',
        },
        {
          name: 'Sweet Corn (Veg)',
          unitPrice: '180.00',
          image: {
            url: 'http://example.com/images/sweet-corn-veg.jpg',
          },
          itemId: '01K86CSPCZXHQTAFK4SPR7ES5S',
        },
        {
          name: 'Sweet Corn (Chicken)',
          unitPrice: '270.00',
          image: {
            url: 'http://example.com/images/sweet-corn-chicken.jpg',
          },
          itemId: '01K86CSPD0MGJFNKSPZ1Q1P4HP',
        },
        {
          name: 'Hot and Sour (Veg)',
          unitPrice: '180.00',
          image: {
            url: 'http://example.com/images/hot-and-sour-veg.jpg',
          },
          itemId: '01K86CSPD0ZNPS6W9FTEX052R3',
        },
        {
          name: 'Hot and Sour (Chicken)',
          unitPrice: '270.00',
          image: {
            url: 'http://example.com/images/hot-and-sour-chicken.jpg',
          },
          itemId: '01K86CSPD1RBVVBPVM30J2Z0SJ',
        },
        {
          name: 'Manchow Soup (Veg)',
          unitPrice: '180.00',
          image: {
            url: 'http://example.com/images/manchow-soup-veg.jpg',
          },
          itemId: '01K86CSPD140ND7YCTA3M39YC3',
        },
        {
          name: 'Manchow Soup (Chicken)',
          unitPrice: '270.00',
          image: {
            url: 'http://example.com/images/manchow-soup-chicken.jpg',
          },
          itemId: '01K86CSPD24H6TGS8M0DEBQ5S5',
        },
      ],
    },
  ],
};

export async function queryMenuByHotel({ hotelId, sections }) {
  return menu.sections[0].items;
}
