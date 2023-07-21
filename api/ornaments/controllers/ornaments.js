'use strict';


/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async create(ctx){
        let orn = await strapi.services.ornaments.create({
            ...ctx.request.body,
            shop:ctx.state.shop
        });
        return orn;
    }
};
