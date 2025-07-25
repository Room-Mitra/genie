const { getUser, addUser } = require("./Login.repository")
const bcrypt = require("bcrypt");

const ID_TYPE = "LOGIN:";
const getId = ({ hotelId, username }) => `${ID_TYPE}${hotelId}:${username}`


const getUserDetails = async ({ hotelId, username }) => {
    const id = getId({ hotelId, username });
    const userData = await getUser(id);
    console.info(`${username} -> ` + "USER DATA :: ", userData)
    if (userData) {
        return userData;
    }
    return null;
}

const verifyUserCredentials = async ({ hotelId, username, password }) => {
    const user = await getUserDetails({ hotelId, username });
    if (!user) {
        return false;
    }
    return await bcrypt.compare(password, user.password);
}

const addUserLogin = async (userData) => {
    const isUserExists = await getUserDetails(userData);
    if (isUserExists) {
        throw new Error("User already exists");
    }

    const { password, hotelId, username } = userData;
    const id = getId({ hotelId, username });
    const hashedPassword = await bcrypt.hash(password, 10);
    userData.password = hashedPassword;
    const isUserAdded = await addUser({ id, ...userData });
    if (!isUserAdded) {
        throw new Error("Failed to add user");
    }
    return isUserAdded;
}

module.exports = {
    verifyUserCredentials, addUserLogin
};