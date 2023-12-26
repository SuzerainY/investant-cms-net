 // The purpose of this file is to define the postgres database which is used in production. When the app is in development, however, the /config/database.js file is used
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