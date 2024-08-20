'use strict';
/**
 * public-blog-subscriber controller
 */
const { createCoreController } = require('@strapi/strapi').factories;
module.exports = createCoreController(
    'api::public-blog-subscriber.public-blog-subscriber',
    ({ strapi }) => ({
        async create(ctx) {
            // @ts-ignore
            const { Email } = ctx.request.body;
            // Find any PublicBlogSubscriber with the same email and return that user is already subscribed
            const publicSubscribers = await strapi.entityService.findMany('api::public-blog-subscriber.public-blog-subscriber', {
                filters: { Email: Email }
            });

            if (publicSubscribers.length > 0) {
                ctx.response.status = 409;
                ctx.send({
                    message: 'Email Is Already A Subscriber',
                    email: Email
                });
                return;
            }

            const response = await super.create(ctx);
            return response;
        },

        async unsubscribe(ctx) {
            try {
                // We should receive a DELETE request with a body containing the user email
                // @ts-ignore
                const { email } = ctx.request.body;
                if (!email) {throw new Error('Email Not Provided In Request Body');}
    
                // Find and delete any PublicBlogSubscriber with the same email
                const publicSubscribers = await strapi.entityService.findMany('api::public-blog-subscriber.public-blog-subscriber', {
                    filters: { Email: email }
                });
    
                if (publicSubscribers.length > 0) {
                    for (const subscriber of publicSubscribers) {
                        await strapi.entityService.delete('api::public-blog-subscriber.public-blog-subscriber', subscriber.id);
                        console.log(`Deleted PublicBlogSubscriber with id ${subscriber.id} from public request.`);
                    }
                } else {ctx.response.status = 409; ctx.send({message: 'Email Is Not A Current Subscriber'})}
    
                ctx.response.status = 200;
                ctx.send({
                    message: 'Unsubscribed Successfully',
                    email: email
                });
            } catch (error) {
                const errorMessage = error.message;
                if (errorMessage === 'Email Not Provided In Request Body') {
                    ctx.response.status = 300;
                    ctx.response.body = { message: errorMessage };
                }
            }
        }
    })
);