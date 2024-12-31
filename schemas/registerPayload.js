module.exports = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    email: {
      type: 'string',
      pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
    },
    password: {
      type: 'string'
    },
  },
  required: [
    'email',
    'password',
  ],
  additionalProperties: false
};
