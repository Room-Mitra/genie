import express from 'express';
import * as UserService from './User.service.js';

const router = express.Router();

router.post('/sign-up', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password are required' });
    }

    const user = await UserService.signUp({ name, email, password });

    return res.status(201).json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.log(err.CancellationReasons[0].Code);
    if (
      err.code === 'TransactionCanceledException' &&
      err?.CancellationReasons?.[0].Code === 'ConditionalCheckFailed'
    ) {
      // Email already taken due to our transactional guard
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('sign-up error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// router.post('/addUser', async (req, res) => {
//   if (!isAuthenticatedUser(req)) {
//     res.status(401).json({ message: 'Unauthorized' });
//     return;
//   }
//   // Extract hotelId and username from request
//   const hotelId = getHotelId(req);
//   const exisitngUserName = getUserName(req);
//   const { username, password } = req.body;
//   console.info(
//     `${exisitngUserName} -> Attempting to add new user: ${username} for hotelId ${hotelId}`
//   );

//   // Validate input
//   if (!username || !password || !hotelId) {
//     console.error(
//       `${exisitngUserName} -> Username: ${username}, hotelId ${hotelId}, password: ${password} :: all fields not present`
//     );
//     res.status(400).json({ message: 'Username, hotelId, and password are required' });
//     return;
//   }

//   try {
//     // Check if user already exists (example query, replace with your actual implementation)
//     const userData = await addUserLogin({ password, hotelId, username });

//     console.info(`Successfully added new user: ${username} for hotelId ${hotelId}`);
//     res.status(201).json({ message: 'User added successfully', user: userData });
//   } catch (e) {
//     console.error(`${exisitngUserName} -> Error while adding new user: ${username}`, e);
//     res.status(500).json({ message: 'An error occurred. Please try again.', error: e });
//   }
// });

export default router;
