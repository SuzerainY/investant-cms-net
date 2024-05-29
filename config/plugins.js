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
          defaultFrom: 'investant.net@gmail.com',
          defaultReplyTo: 'investant.net@gmail.com',
        },
      },
    },
    // ...
});