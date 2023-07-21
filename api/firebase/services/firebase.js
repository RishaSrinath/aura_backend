'use strict';
const admin = require('firebase-admin');
var adminCreds = require("./creds.json");


admin.initializeApp({
  credential:admin.credential.cert(adminCreds)
});

/**
 * `firebase` service.
 */

module.exports = {
  authenticate: async(obj) =>{
    try{
      
    }
    catch(err){
      return null;
    }
  }
};
