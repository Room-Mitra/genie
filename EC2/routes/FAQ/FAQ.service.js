const { addFAQ, getFAQ } = require("./FAQ.repository");

const registerFAQ = async (faq, userDetails) => {
    const { hotelId } = userDetails;
    faq.hotelId = hotelId;
    return await addFAQ(faq);
}

const fetchFAQ = async (hotelId) => {
    return await getFAQ(hotelId);
}

module.exports = { registerFAQ, fetchFAQ }
