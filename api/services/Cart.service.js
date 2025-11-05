import { getItemsOnMenu } from './Menu.service.js';

function cartValidationError(errors, { code, message }) {
  errors.push({
    code,
    message,
  });
  return errors;
}

export async function validateCart({ hotelId, cart, allItems }) {
  if (!cart.items?.length)
    return {
      errors: cartValidationError([], { code: 'empty_cart', message: 'No items provided' }),
    };

  if (!allItems) {
    allItems = await getItemsOnMenu({ hotelId });
  }

  const itemsMap = new Map(allItems.map((i) => [i.itemId, i]));

  let errors = [];



  for (const cartItem of cart.items) {
    // const item = allItems.filter((i) => i.itemId === cartItem.itemItem)?.[0];
    const item = itemsMap.get(cartItem.itemId);
    if (!item) {
      errors = cartValidationError(errors, {
        code: 'item_not_found',
        message: `item with id ${cartItem.itemId} is not found`,
      });
      continue;
    }

    if (!(0 < cartItem.quantity && cartItem.quantity < 21)) {
      errors = cartValidationError(errors, {
        code: 'invalid_quantity',
        message: `item quantity has to be 1 - 20 only`,
      });
    }
  }

  return { errors };
}
