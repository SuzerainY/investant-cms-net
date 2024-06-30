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

// Convert UTC to Eastern Time
const convertUTCtoEastern = (utcDate) => {
    // Create a new date object from UTC date
    let date = new Date(utcDate);
    const isEDT = () => {
        const month = date.getMonth() + 1;
        return month >= 3 && month <= 11; // Months 3 to 11 are EDT (March to November)
    };
    const easternOffset = isEDT() ? -4 : -5;
    date.setHours(date.getHours() + (easternOffset - date.getTimezoneOffset() / 60));
    return date;
};

module.exports = {
    async afterCreate({ result }) {
        try {
            // Set time to Eastern
            let openedAtEastern = convertUTCtoEastern(result.OpenedAt);
            await strapi.entityService.update('api::contact-us-submission.contact-us-submission', result.id, {
                data: {OpenedAt: openedAtEastern}
            });

            // Check if the ContactEmail matches an existing user and add relation if so
            const matchingUser = await strapi.query('plugin::users-permissions.user').findOne({where: { email: result.ContactEmail }});
            if (matchingUser) {
                await strapi.entityService.update('api::contact-us-submission.contact-us-submission', result.id, {
                    data: {users_permissions_user: matchingUser.id}
                });
            }

            // Add HTML for new line characters to the message
            let parsedMessage = result.Message.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
            
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