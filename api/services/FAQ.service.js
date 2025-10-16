import { addFAQ, getFAQ } from '#repositories/FAQ.repository.js';

export const registerFAQ = async (faq, userDetails) => {
  const { hotelId } = userDetails;
  faq.hotelId = hotelId;
  return await addFAQ(faq);
};

export const fetchFAQ = async (hotelId) => {
  return await getFAQ(hotelId);
};
