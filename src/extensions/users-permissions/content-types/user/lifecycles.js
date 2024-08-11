const newUserEmailVerification = require('../../../../emails/templates/verification/new-user-email-verification.js');
const investantURL = process.env.INVESTANT_FRONT_URL;

// Return a Date as String: 'February 30, 2023'
const formatDate = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const year = date.getUTCFullYear();
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    
    return `${month} ${day}, ${year}`;
};

module.exports = {
    async afterCreate({ result }) {
        try {
            // If the brand new user was just created as confirmed, then update them back to not confirmed
            if (result.confirmed === true) {
                await strapi.plugin('users-permissions').services.user.edit(result.id, { confirmed: false });
            }

            // Ensure confirmationToken is generated
            if (!result.confirmationToken) {
                // You might need to manually create the confirmationToken here
                result.confirmationToken = strapi.plugins['users-permissions'].services.jwt.issue({ id: result.id });
                await strapi.query('plugin::users-permissions.user').update({
                    where: { id: result.id },
                    data: { confirmationToken: result.confirmationToken }
                });
            }

            // Generate the user's email verification link to our front-end 'verify-email' API
            const confirmationUrl = `${investantURL}/api/verify-email?confirmationToken=${result.confirmationToken}`;

            // Fetch the two most recent published blog posts for display in the email
            const recentPosts = await strapi.entityService.findMany('api::blog-post.blog-post', {
                filters: { publishedAt: { $notNull: true } },
                sort: { id: 'desc' },
                limit: 2,
                populate: ['SPLASH'], // Ensure SPLASH is populated
            });
            const blogTwo = recentPosts[0];
            const blogThree = recentPosts[1];

            const emailHTML = newUserEmailVerification({
                username: result.username,
                confirmationUrl: confirmationUrl,
                blogTwoImage: blogTwo.SPLASH.url,
                blogTwoTitle: blogTwo.Title,
                blogTwoDescription: blogTwo.BlogPostDescription,
                blogTwoDate: formatDate(new Date(blogTwo.PublishDate)),
                blogTwoURL: `${investantURL}/blog/${blogTwo.SLUG}`,
                blogThreeImage: blogThree.SPLASH.url,
                blogThreeTitle: blogThree.Title,
                blogThreeDescription: blogThree.BlogPostDescription,
                blogThreeDate: formatDate(new Date(blogThree.PublishDate)),
                blogThreeURL: `${investantURL}/blog/${blogThree.SLUG}`,
                aboutUsURL: `${investantURL}/about-us`
            });

            await strapi.plugins['email'].services.email.send({
                to: result.email,
                from: {
                    email: "info@investant.net",
                    name: "Investant Team"
                },
                subject: 'Investant | Verify Email',
                html: emailHTML
            });
        } catch (error) { console.log(error.message); }
    },
};