module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || '!!CryptoCat@!!',
  jwtExpirationInSeconds:  parseInt(process.env.JWT_EXPIRATION_IN_SECONDS) || 60 * 60, // 1 hour
}
