module.exports = {
    async afterCreate({ result }) {
        // If the brand new user was just created as confirmed, then update them back to not confirmed
        if (result.confirmed === true) {
            await strapi.plugin('users-permissions').services.user.edit(result.id, { confirmed: false });
        }
    },
};