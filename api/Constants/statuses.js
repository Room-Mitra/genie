export const RequestStatus = {
  UNACKNOWLEDGED: 'unacknowledged',
  IN_PROGRESS: 'in_progress',
  DELAYED: 'delayed',
  COMPLETED: 'completed',
};

export const RequestStatuses = [
  RequestStatus.UNACKNOWLEDGED,
  RequestStatus.IN_PROGRESS,
  RequestStatus.DELAYED,
  RequestStatus.COMPLETED,
];

export const ActiveRequestStatuses = [
  RequestStatus.UNACKNOWLEDGED,
  RequestStatus.IN_PROGRESS,
  RequestStatus.DELAYED,
];

export const InActiveRequestStatuses = [RequestStatus.COMPLETED];

export const OrderStatus = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  DELAYED: 'delayed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  SCHEDULED: 'scheduled',
};

export const OrderStatuses = [
  OrderStatus.PENDING,
  OrderStatus.PREPARING,
  OrderStatus.DELAYED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.SCHEDULED,
];

export const ActiveOrderStatuses = [
  OrderStatus.PENDING,
  OrderStatus.PREPARING,
  OrderStatus.DELAYED,
];

export const InactiveOrderStatuses = [OrderStatus.CANCELLED, OrderStatus.DELIVERED];
