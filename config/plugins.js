module.exports = ({ env }) => ({
    // ...
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_KEY,
          api_secret: process.env.CLOUDINARY_SECRET,
        },
        actionOptions: {
          upload: {},
          delete: {},
        },
      },
    },
    'users-permissions': {
      config: {
        jwtSecret: String(process.env.JWT_SECRET),
        jwt: { expiresIn: '7d', }, // Here we are defining lifetime for User JWTs
        register: {
          allowedFields: ["firstname", "lastname", "blogPostSubscription"],
        }
      },
    },
    email: {
      config: {
        provider: 'sendgrid',
        providerOptions: {
          apiKey: process.env.INVESTANT_NET_GMAIL_SENDGRID_API_KEY,
        },
        settings: {
          defaultFrom: 'info@investant.net',
          defaultReplyTo: 'info@investant.net',
        },
      },
    },
    // ...
});