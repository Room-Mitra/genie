const getDaysSinceEpoch = (timeStamp) => {
    const date = new Date(+timeStamp);
    return Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
}

const getHotelId = (req) => {
    const userData = req.userData;
    const { hotelId } = userData;
    return hotelId;
}


module.exports = { getDaysSinceEpoch, getHotelId };
