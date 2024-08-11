module.exports = (plugin) => {

    // Controller extension for the PUT method on /user/me route of users-permissions plugin content-api
    plugin.controllers.user.updateMe = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id) {return ctx.unauthorized();}

        try {
            // Extract only the fields that need to be updated from the request body
            const { username, email, blogPostSubscription } = ctx.request.body;

            const updatedUserData = {};
            if (username) {
                const userWithSameUsername = await strapi.query('plugin::users-permissions.user').findOne({ where: { username } });
                if (userWithSameUsername && (userWithSameUsername.id !== ctx.state.user.id)) {
                    throw new Error("Username already taken");
                }
                updatedUserData.username = username;
            }
            if (email) {
                const userWithSameEmail = await strapi.query('plugin::users-permissions.user').findOne({ where: { email: email.toLowerCase() } });
                if (userWithSameEmail && (userWithSameEmail.id !== ctx.state.user.id)) {
                    throw new Error("Email already taken");
                }
                updatedUserData.email = email;
            }
            if (typeof blogPostSubscription === 'boolean') {updatedUserData.blogPostSubscription = blogPostSubscription;}

            // Update the user data in the database
            await strapi.query('plugin::users-permissions.user').update({
                where: { id: ctx.state.user.id },
                data: updatedUserData
            });
            ctx.response.status = 200;
            ctx.send({
                message: "User updated successfully",
                userInfo: updatedUserData
            });
        } catch (error) {
            const errorMessage = error.message;
            if (errorMessage === "Username already taken" || errorMessage === "Email already taken") {
                ctx.response.status = 409;
                ctx.response.body = { message: errorMessage };
            } else {
                ctx.response.status = 500;
                ctx.response.body = { error: "Unable to update user", details: errorMessage };
            }
        }
    };
    // Push our controller as the PUT handler for new content-api route: /user/me
    plugin.routes['content-api'].routes.push({
        method: "PUT",
        path: "/user/me",
        handler: "user.updateMe",
        config: {
            prefix: "",
            policies: []
        }
    });

    // Controller extension for the DELETE method on /user/me route of users-permissions plugin content-api
    plugin.controllers.user.deleteMe = async (ctx) => {
        const sanitizeOutput = async (user, ctx) => {
            const { sanitize } = require('@strapi/utils');
            const schema = strapi.getModel('plugin::users-permissions.user');
            const { auth } = ctx.state;
            
            return sanitize.contentAPI.output(user, schema, { auth });
        };
        
        if (!ctx.state.user || !ctx.state.user.id) {return ctx.unauthorized();}

        try {
            // Get the authenticated user ID
            const userId = ctx.state.user.id;

            // Proceed with account deletion
            const data = await strapi.plugin('users-permissions').service('user').remove({ id: userId });
            const sanitizedUser = await sanitizeOutput(data, ctx);

            ctx.send(sanitizedUser);
        } catch (error) {
            const errorMessage = error.message;
            ctx.response.status = 500;
            ctx.response.body = { error: 'Unable to delete user', details: errorMessage };
        }
    };
    // Push our controller as the DELETE handler for new content-api route: /user/me
    plugin.routes['content-api'].routes.push({
        method: "DELETE",
        path: "/user/me",
        handler: "user.deleteMe",
        config: {
            prefix: "",
            policies: []
        }
    });

    return plugin;
};