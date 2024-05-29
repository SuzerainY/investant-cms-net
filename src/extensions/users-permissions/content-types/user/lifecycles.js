module.exports = {
    async afterCreate({ result }) {
        console.log("New user created");

        // If the brand new user was just created as confirmed, then update them back to not confirmed
        if (result.confirmed === true) {
            console.log("User was confirmed");
            await strapi.plugin('users-permissions').services.user.edit(result.id, { confirmed: false });
        }
    },
};