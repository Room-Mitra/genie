const getDaysSinceEpoch = (timeStamp) => {
    const date = new Date(+timeStamp);
    return Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
}


module.exports = { getDaysSinceEpoch };
