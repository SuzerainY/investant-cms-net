const blogPostNotification = require('../../../../emails/templates/notification/blog-post-notification.js');

module.exports = {
    async afterUpdate({ result, params }) {

        // Check if the post itself has just been published (not an edit to a parameter of the post)
        if ((result.publishedAt != null && result.publishedAt != undefined) && (params.publishedAt == null || params.publishedAt == undefined)) {

            // Check if the post should be sent as an email on publish and hasn't already been sent (was unpublished and now published again)
            if (result.SendEmailOnPublish === true && result.EmailSent !== true) {
                try {
                    // Retrieve the list of confirmed and subscribed users to notify
                    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {filters: { confirmed: true, blogPostSubscription: true }});

                    // Fetch the two most recent published blog posts before this one for display in the email
                    const recentPosts = await strapi.entityService.findMany('api::blog-post.blog-post', {
                        filters: {
                            publishedAt: { $notNull: true },
                            id: { $lt: result.id }
                        },
                        sort: { id: 'desc' },
                        limit: 2,
                        populate: ['SPLASH'], // Ensure SPLASH is populated
                    });
                    const blogTwo = recentPosts[0];
                    const blogThree = recentPosts[1];

                    const emailHTML = blogPostNotification({
                        featureBlogImage: result.SPLASH.formats.medium.url,
                        featureBlogTitle: result.Title,
                        featureBlogAuthor: result.Author,
                        featureBlogDescription: result.BlogPostDescription,
                        featureBlogURL: `https://investant.net/blog/${result.SLUG}`,
                        blogTwoImage: blogTwo.SPLASH.formats.small.url,
                        blogTwoTitle: blogTwo.Title,
                        blogTwoDescription: blogTwo.BlogPostDescription,
                        blogTwoURL: `https://investant.net/blog/${blogTwo.SLUG}`,
                        blogThreeImage: blogThree.SPLASH.formats.small.url,
                        blogThreeTitle: blogThree.Title,
                        blogThreeDescription: blogThree.BlogPostDescription,
                        blogThreeURL: `https://investant.net/blog/${blogThree.SLUG}`,
                        SenderName: "",
                        SenderAddress: "",
                        SenderCity: "",
                        SenderState: "",
                        SenderZip: "",
                        unsubscribeLink: "https://investant.net", // Unsubscribe form link
                    });

                    // Send the email to each user
                    for (const user of users) {
                        await strapi.plugins['email'].services.email.send({
                            to: user.email,
                            subject: `Investant | ${result.Title}`,
                            html: emailHTML
                        });
                    }

                    // Update the EmailSent field to true after emails are sent
                    await strapi.entityService.update('api::blog-post.blog-post', result.id, { data: { EmailSent: true } });
                } catch (error) {console.error(error);}
            }
        }
    },
};