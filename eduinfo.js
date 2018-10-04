const assert = require('assert');
const _ = require('lodash');
const USERS = require('./UserData');

class Eduinfo {
  constructor(id) {
    this.accountId = id; // the property named accountId is important to oidc-provider
  }

  // claims() should return or resolve with an object with claims that are mapped 1:1 to
  // what your OP supports, oidc-provider will cherry-pick the requested ones automatically
  claims() {
	const obj = {
	  sub: this.accountId,
	  titles: {
		  schoolid: USERS[this.accountId].schoolid, 
		  titles: USERS[this.accountId].titles
	  },
	  classinfo: {
		  year: USERS[this.accountId].year,
		  semester: USERS[this.accountId].semester,
		  schoolid: USERS[this.accountId].schoolid,
		  grade: USERS[this.accountId].grade,
		  classno: USERS[this.accountId].classno,
		  classtitle: USERS[this.accountId].classtitle
	  },
	};
    return Object.assign({}, obj);
  }

  static async findById(ctx, id) {
    // this is usually a db lookup, so let's just wrap the thing in a promise, oidc-provider expects
    // one
    return new Eduinfo(id);
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

module.exports = Eduinfo;
