const blogPostNotification = require('../../../../emails/templates/notification/blog-post-notification.js');
const InvestantURL = process.env.INVESTANT_FRONT_URL;

module.exports = {
    async afterUpdate({ result, params }) {

        // Check if the post itself has just been published (not an edit to a parameter of the post)
        if ((result.publishedAt != null && result.publishedAt != undefined) && (params.publishedAt == null || params.publishedAt == undefined)) {

            // Replace any spaces with hyphens in the SLUG
            let newSLUG = result.SLUG.replace(' ', '-');
            if (newSLUG !== result.SLUG) {strapi.entityService.update('api::blog-post.blog-post', result.id, { data: { SLUG: newSLUG } });}

            // Check if the post should be sent as an email on publish and hasn't already been sent (was unpublished and now published again)
            if (result.EmailSent !== true && result.SendEmailOnPublish === true) {
                try {
                    // Retrieve the list of confirmed and subscribed users to notify and public blog subscribers
                    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {filters: { confirmed: true, blogPostSubscription: true }});
                    const publicSubscribers = await strapi.entityService.findMany('api::public-blog-subscriber.public-blog-subscriber', {filters: {}});

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

                    const userEmailHTML = blogPostNotification({
                        featureBlogImage: result.SPLASH.url,
                        featureBlogTitle: result.Title,
                        featureBlogAuthor: result.Author,
                        featureBlogDescription: result.BlogPostDescription,
                        featureBlogURL: `${InvestantURL}/blog/${newSLUG !== result.SLUG ? newSLUG : result.SLUG}`,
                        blogTwoImage: blogTwo.SPLASH.url,
                        blogTwoTitle: blogTwo.Title,
                        blogTwoDescription: blogTwo.BlogPostDescription,
                        blogTwoURL: `${InvestantURL}/blog/${blogTwo.SLUG}`,
                        blogThreeImage: blogThree.SPLASH.url,
                        blogThreeTitle: blogThree.Title,
                        blogThreeDescription: blogThree.BlogPostDescription,
                        blogThreeURL: `${InvestantURL}/blog/${blogThree.SLUG}`,
                        SenderName: "Investant",
                        SenderAddress: "",
                        SenderCity: "",
                        SenderState: "",
                        SenderZip: "",
                        unsubscribeLink: `${InvestantURL}/account?block=subscriptions`, // Unsubscribe form link for user accounts
                    });

                    const publicEmailHTML = blogPostNotification({
                        featureBlogImage: result.SPLASH.url,
                        featureBlogTitle: result.Title,
                        featureBlogAuthor: result.Author,
                        featureBlogDescription: result.BlogPostDescription,
                        featureBlogURL: `${InvestantURL}/blog/${newSLUG !== result.SLUG ? newSLUG : result.SLUG}`,
                        blogTwoImage: blogTwo.SPLASH.url,
                        blogTwoTitle: blogTwo.Title,
                        blogTwoDescription: blogTwo.BlogPostDescription,
                        blogTwoURL: `${InvestantURL}/blog/${blogTwo.SLUG}`,
                        blogThreeImage: blogThree.SPLASH.url,
                        blogThreeTitle: blogThree.Title,
                        blogThreeDescription: blogThree.BlogPostDescription,
                        blogThreeURL: `${InvestantURL}/blog/${blogThree.SLUG}`,
                        SenderName: "Investant",
                        SenderAddress: "",
                        SenderCity: "",
                        SenderState: "",
                        SenderZip: "",
                        unsubscribeLink: `${InvestantURL}/unsubscribe-blog`, // Unsubscribe form link for public subscribers
                    });

                    // Send the email to each user account
                    for (const user of users) {
                        await strapi.plugins['email'].services.email.send({
                            to: user.email,
                            from: {
                                email: "info@investant.net",
                                name: "Investant Team"
                            },
                            subject: `Investant | ${result.Title}`,
                            html: userEmailHTML
                        });
                    }

                    // Send the email to each public email subscriber
                    for (const publicSubscriber of publicSubscribers) {
                        await strapi.plugins['email'].services.email.send({
                            to: publicSubscriber.Email,
                            from: {
                                email: "info@investant.net",
                                name: "Investant Team"
                            },
                            subject: `Investant | ${result.Title}`,
                            html: publicEmailHTML
                        });
                    }

                    // Update the EmailSent field to true after emails are sent
                    await strapi.entityService.update('api::blog-post.blog-post', result.id, { data: { EmailSent: true } });
                } catch (error) {console.error('Error in BlogPost afterCreate lifecycle:', error);}
            }
        }
    },
};