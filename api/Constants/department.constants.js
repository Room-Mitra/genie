export const Department = {
  HOUSE_KEEPING: 'house_keeping',
  ROOM_SERVICE: 'room_service',
  FRONT_OFFICE: 'front_office',
  CONCIERGE: 'concierge',
  FACILITIES: 'facilities',
  GENERAL_ENQUIRY: 'general_enquiry',
};

export const REQUEST_DEPARTMENT_TO_STAFF_DEPARTMENTS = {
  [Department.ROOM_SERVICE]: [Department.ROOM_SERVICE],
  [Department.HOUSE_KEEPING]: [Department.HOUSE_KEEPING],
  [Department.FRONT_OFFICE]: [Department.FRONT_OFFICE],
  [Department.FACILITIES]: [Department.FACILITIES],
  [Department.CONCIERGE]: [Department.CONCIERGE],
  [Department.GENERAL_ENQUIRY]: [Department.FRONT_OFFICE, Department.CONCIERGE],
};
