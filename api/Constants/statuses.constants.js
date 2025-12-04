export const RequestStatus = {
  NEW: 'new',
  UNACKNOWLEDGED: 'unacknowledged',
  IN_PROGRESS: 'in_progress',
  DELAYED: 'delayed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const RequestStatuses = Object.values(RequestStatus);

export const ActiveRequestStatuses = [
  RequestStatus.NEW,
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

export const OrderStatuses = Object.values(OrderStatus);

export const ActiveOrderStatuses = [
  OrderStatus.PENDING,
  OrderStatus.PREPARING,
  OrderStatus.DELAYED,
];

export const InactiveOrderStatuses = [OrderStatus.CANCELLED, OrderStatus.DELIVERED];

export const DutyStatus = {
  ON_DUTY: 'on_duty',
  OFF_DUTY: 'off_duty',
  ON_BREAK: 'on_break',
};

export const DutyStatuses = Object.values(DutyStatus);

export const ActiveDutyStatuses = [DutyStatus.ON_DUTY];
export const InactiveDutyStatuses = [DutyStatus.OFF_DUTY, DutyStatus.ON_BREAK];
