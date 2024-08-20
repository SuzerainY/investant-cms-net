module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/public-blog-subscriber/unsubscribe',
            handler: 'api::public-blog-subscriber.public-blog-subscriber.unsubscribe',
            config: {
                auth: false,
            },
        },
    ],
};