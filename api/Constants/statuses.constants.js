export const RequestStatus = {
  UNACKNOWLEDGED: 'unacknowledged',
  IN_PROGRESS: 'in_progress',
  DELAYED: 'delayed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const RequestStatuses = [
  RequestStatus.UNACKNOWLEDGED,
  RequestStatus.IN_PROGRESS,
  RequestStatus.DELAYED,
  RequestStatus.COMPLETED,
  RequestStatus.CANCELLED,
];

export const ActiveRequestStatuses = [
  RequestStatus.UNACKNOWLEDGED,
  RequestStatus.IN_PROGRESS,
  RequestStatus.DELAYED,
];

export const InActiveRequestStatuses = [RequestStatus.COMPLETED, RequestStatus.CANCELLED];

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
