module.exports = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ["event", "email"],
    },
    subject: {
      type: 'string',
      minLength: 1
    },
    agenda_or_body: {
      type: 'string',
      minLength: 1
    },
    date_of_activity: {
      type: 'string',
      pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
    },
    location: {
      type: 'string',
      minLength: 1
    },
  },
  required: [
    'category',
    'subject',
    'agenda_or_body',
    'date_of_activity',
    'location',
  ],
  additionalProperties: false
};
