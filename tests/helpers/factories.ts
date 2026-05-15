export const createUser = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'password',
  roles: ['user'],
  ...overrides,
});