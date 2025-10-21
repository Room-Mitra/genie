import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  // const deviceId = req.headers['x-device-id'];
  const { department, totalAmount, instructions, items } = req.body;
  // {
  //   department: 'Restaurant',
  //   totalAmount: 1310,
  //   data: { cart: [ [Object], [Object], [Object] ], instructions: 'vvv' }
  // }
  // {"department":"Restaurant","totalAmount":1310,"data":{"cart":[{"dish":"Pumpkin Soup","unitPrice":160,"count":2,"dishTotal":320},{"dish":"Cream of Broccoli","unitPrice":190,"count":1,"dishTotal":190},{"dish":"Mushroom Soup","unitPrice":200,"count":4,"dishTotal":800}],"instructions":"vvv"}}

  res
    .status(200)
    .json({ message: 'Order placed successfully', department, totalAmount, instructions, items });
});

export default router;
