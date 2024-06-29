const userContactUsFormSubmissionNotification = require('../../../../emails/templates/notification/user-contact-us-form-submission-notification.js');
const strapiURL = process.env.INVESTANT_ADMIN_URL;

// Return a String as '11:52 AM on February 30, 2023'
const formatDate = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    let hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'

    return `${hour}:${minute} ${ampm} on ${month} ${day}, ${year} Eastern`;
};

// Convert UTC date to Eastern Time. Eastern Standard Time (EST) is UTC-5. Eastern Daylight Time (EDT) is UTC-4
const convertUTCtoEastern = (date) => {
    // Get the offset in minutes
    const offset = date.getTimezoneOffset(); // in minutes
    const utcOffset = -offset / 60; // convert to hours

    let estOffset = -5;
    // Check if Daylight Saving Time is in effect
    const isDST = (date) => {
        const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
        const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
        return Math.max(jan, jul) !== date.getTimezoneOffset();
    };
    if (isDST(date)) {estOffset = -4;}

    // Calculate the time difference in milliseconds
    const timeDifference = (estOffset - utcOffset) * 60 * 60 * 1000;
    return new Date(date.getTime() + timeDifference);
};

module.exports = {
    async afterCreate({ result }) {
        try {
            // Check if the ContactEmail matches an existing user and add relation if so
            const matchingUser = await strapi.query('plugin::users-permissions.user').findOne({where: { email: result.ContactEmail }});
            if (matchingUser) {
                await strapi.entityService.update('api::contact-us-submission.contact-us-submission', result.id, {
                    data: {users_permissions_user: matchingUser.id}
                });
            }

            // Add HTML for new line characters to the message
            let parsedMessage = result.Message.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
            let openedAtEastern = convertUTCtoEastern(new Date(result.OpenedAt));
            
            const emailHTML = userContactUsFormSubmissionNotification({
                submissionID: result.id,
                submissionAdminLink: `${strapiURL}/admin/content-manager/collectionType/api::contact-us-submission.contact-us-submission/${result.id}`,
                contactName: result.ContactName,
                contactEmail: result.ContactEmail,
                openedAt: formatDate(openedAtEastern),
                subject: result.Subject,
                message: parsedMessage
            });

            await strapi.plugins['email'].services.email.send({
                to: 'investant-executives@investant.net',
                subject: 'Investant | User Contact Us Submission',
                html: emailHTML
            });
        } catch (error) { console.log(error.message); }
    },
};