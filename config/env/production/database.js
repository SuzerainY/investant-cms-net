 // strapi-api/config/database.js
 module.exports = ({ env }) => ({
    connection: {
      client: 'postgres',
      connection: {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT, // May need to cast to integer
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        ssl: {
          ca: process.env.DATABASE_CA,
        },
      },
      debug: false,
    },
  });