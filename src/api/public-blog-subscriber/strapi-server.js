module.exports = (plugin) => {

    // Controller extension for the DELETE method of /public-blog-subscriber/unsubscribe route of public-blog-subscriber plugin
    plugin.controllers.publicBlogSubscriber.unsubscribe = async (ctx) => {
        try {
            // We should receive a DELETE request with a body containing the user email
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
    };
    // Push our controller as the DELETE handler for new content-api route: /public-blog-subscriber/unsubscribe
    plugin.routes['content-api'].routes.push({
        method: "DELETE",
        path: "/public-blog-subscriber/unsubscribe",
        handler: "publicBlogSubscriber.unsubscribe",
        config: {
            prefix: "",
            policies: []
        }
    });

    return plugin;
};