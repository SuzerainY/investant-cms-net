module.exports = {
    async afterCreate({ result, params }) {
        
        // On PublicBlogSubscriber Creation -> if Account has same email, delete this PublicBlogSubscriber
        try {
            // Check if a user account exists with the same email
            const userAccount = await strapi.entityService.findMany('plugin::users-permissions.user', {filters: { email: result.Email }});

            // If a user account exists, delete the newly created PublicBlogSubscriber
            if (userAccount.length > 0) {
                await strapi.entityService.delete('api::public-blog-subscriber.public-blog-subscriber', result.id);
                console.log(`Deleted duplicate PublicBlogSubscriber with id ${result.id}`);
            }
        } catch (error) {console.error('Error in PublicBlogSubscriber afterCreate lifecycle:', error);}
    },
};