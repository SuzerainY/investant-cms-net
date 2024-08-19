'use strict';

/**
 * public-blog-subscriber service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::public-blog-subscriber.public-blog-subscriber');
