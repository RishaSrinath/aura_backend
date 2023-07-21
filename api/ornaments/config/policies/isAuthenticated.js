'use strict';

/**
 * `isAuthenticated` policy.
 */

module.exports = async (ctx, next) => {
  // Add your own logic here.
  const user = ctx.state.user;
  // console.log('In isAuthenticated policy.');
  if (user) {
    const admin = await strapi.services['shop-admins'].findOne({
      user: user._id
    })
    ctx.state.shop = admin.shop.id;
    ctx.query['_limit'] = 1000;
    ctx.query['shop'] = admin.shop.id;
  }
  await next();
};
