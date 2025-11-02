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
