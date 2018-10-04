const assert = require('assert');
const _ = require('lodash');
const USERS = require('./UserData');

class Account {
  constructor(id) {
    this.accountId = id; // the property named accountId is important to oidc-provider
  }

  // claims() should return or resolve with an object with claims that are mapped 1:1 to
  // what your OP supports, oidc-provider will cherry-pick the requested ones automatically
  claims() {
	const obj = {
	  sub: this.accountId,
	  name: USERS[this.accountId].name, 
	  given_name: USERS[this.accountId].given_name,
	  family_name: USERS[this.accountId].family_name,
	  email: USERS[this.accountId].email,
	};
    return Object.assign({}, obj);
  }

  static async findById(ctx, id) {
    // this is usually a db lookup, so let's just wrap the thing in a promise, oidc-provider expects
    // one
    return new Account(id);
  }

  static async authenticate(email, password) {
    assert(password, 'password must be provided');
    assert(email, 'email must be provided');
    const lowercased = String(email).toLowerCase();
    const id = _.findKey(USERS, { email: lowercased });
    assert(id, 'invalid credentials provided');

    // this is usually a db lookup, so let's just wrap the thing in a promise
    return new this(id);
  }
}

module.exports = Account;
