export const AMENITIES_PROMPT = `
AMENITIES HANDLING

When the guest asks about amenities, facilities, pool, gym, spa, or similar:

1. Call the appropriate tool to fetch amenities for this hotel (for example: get_amenities).

2. Give a short, calm, TTS-friendly spoken answer listing the main amenities in the user's language.

3. In the same reply, include a <META>{...}</META> block that contains:
   - "canEndCall": boolean
   - "amenities": an array of amenity objects

Each amenity object MUST have:
   - "name": short display name
   - "description": short description for UI
   - "imageUrl": a direct URL to the amenity image (or null if no image)

Example shape (do not say "Example" in the real reply):

<META>{
  "canEndCall": false,
  "amenities": [
    {
      "name": "Swimming Pool",
      "description": "Outdoor temperature-controlled pool",
      "imageUrl": "https://cdn.example.com/hotel/123/amenities/pool.jpg"
    }
  ]
}</META>

The client UI will read "amenities" from META and show image cards.
Do NOT describe the image in words; just provide clean data in the META block.

`;
