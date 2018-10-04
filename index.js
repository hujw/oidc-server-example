// see previous example for the things that are not commented

const assert = require('assert');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const Provider = require('oidc-provider');

// simple account model for this application, user list is defined like so
const Account = require('./account');
const Eduinfo = require('./eduinfo');

const CLIENT_ID = 'a1bb36b684b5638076f5cae5414947aa';
const CLIENT_SECRET = '8fbb9a0711de7a1121851f2372da2fe156cc1ad52c4d538d675ccf6c26bab41e';
const hash = Buffer.from( CLIENT_ID +":"+ CLIENT_SECRET).toString('base64');
console.log('hash: ' + hash);

const oidc = new Provider('http://localhost:3000/oidc/', {

  // oidc-provider only looks up the accounts by their ID when it has to read the claims,
  // passing it our Account model method is sufficient, it should return a Promise that resolves
  // with an object with accountId property and a claims method.
  findById: Account.findById,
  findEduById: Eduinfo.findById,

  // let's tell oidc-provider we also support the email and name scope
  claims: {
    // scope: [claims] format
    openid: ['sub'],
	//email: ['email'],
	//name: ['name'],
	profile: ['openid', 'name', 'given_name', 'family_name', 'email'],
	eduinfo: ['schoolid', 'titles', 'classinfo'],
  },

  // let's tell oidc-provider where our own interactions will be
  // setting a nested route is just good practice so that users
  // don't run into weird issues with multiple interactions open
  // at a time.
  interactionUrl(ctx) {
    return `/interaction/${ctx.oidc.uuid}`;
  },
  formats: {
    default: 'opaque',
    AccessToken: 'jwt',
  },
  features: {
    // disable the packaged interactions
    devInteractions: false,

    claimsParameter: true,
    conformIdTokenClaims: true,
    discovery: true,
    encryption: true,
    introspection: true,
    registration: true,
    request: true,
    requestUri: true,
    revocation: true,
    sessionManagement: true,
  },
  routes: {
	authorization: '/oidc/auth',
    certificates: '/oidc/certs',
    check_session: '/oidc/session/check',
    device_authorization: '/oidc/device/auth',
    end_session: '/oidc/session/end',
    introspection: '/oidc/token/introspection',
	registration: '/oidc/reg',
	revocation: '/oidc/token/revocation',
    token: '/oidc/token',
    userinfo: '/oidc/userinfo',
	eduinfo: '/cncresource/eduinfo',
	code_verification: '/oidc/device',
  },
});

const keystore = require('./keystore.json');

oidc.initialize({
  keystore,
  clients: [
    // reconfigured the foo client for the purpose of showing the adapter working
//    {
//      client_id: 'foo',
//      redirect_uris: ['https://example.com'],
//      response_types: ['id_token token'],
//      grant_types: ['implicit'],
//      token_endpoint_auth_method: 'none',
//    },
	{
		client_id: 'test_oauth_app',
		client_secret: 'super_secret',
		//grant_types: ['client_credentials'],
		grant_types: ['authorization_code'],
		response_types: ['code'],
		redirect_uris: ['https://example.com'],
	}
  ],
}).then(() => {
  // let's work with express here, below is just the interaction definition
  const expressApp = express();
  expressApp.set('trust proxy', true);
  expressApp.set('view engine', 'ejs');
  expressApp.set('views', path.resolve(__dirname, 'views'));

  const parse = bodyParser.urlencoded({ extended: false });

  expressApp.get('/interaction/:grant', async (req, res) => {
    oidc.interactionDetails(req).then((details) => {
      console.log('see what else is available to you for interaction views', details);

      const view = (() => {
        switch (details.interaction.reason) {
          case 'consent_prompt':
          case 'client_not_authorized':
            return 'interaction';
          default:
            return 'login';
        }
      })();

      res.render(view, { details });
    });
  });

  expressApp.post('/interaction/:grant/confirm', parse, (req, res) => {
    oidc.interactionFinished(req, res, {
      consent: {},
    });
  });

  expressApp.post('/interaction/:grant/login', parse, (req, res, next) => {
    Account.authenticate(req.body.email, req.body.password)
      .then(account => oidc.interactionFinished(req, res, {
        login: {
          account: account.accountId,
          acr: '1',
          remember: !!req.body.remember,
          ts: Math.floor(Date.now() / 1000),
        },
        consent: {
          // TODO: remove offline_access from scopes if remember is not checked
        },
      })).catch(next);
  });

    // leave the rest of the requests to be handled by oidc-provider, there's a catch all 404 there
  expressApp.use(oidc.callback);

  // express listen
  expressApp.listen(3000);
});

/*
const oidc2 = new Provider('http://localhost:3001/cncresource/', {

  // oidc-provider only looks up the accounts by their ID when it has to read the claims,
  // passing it our Account model method is sufficient, it should return a Promise that resolves
  // with an object with accountId property and a claims method.
  findById: Eduinfo.findById,

  // let's tell oidc-provider we also support the email and name scope
  claims: {
    // scope: [claims] format
    openid: ['sub'],
	eduinfo: ['schoolid', 'titles', 'classinfo'],
	//titles: ['schoolid', 'titles'],
	//classinfo: ['schoolid', 'year', 'semester', 'grade', 'class', 'classtitle'],
  },

  // let's tell oidc-provider where our own interactions will be
  // setting a nested route is just good practice so that users
  // don't run into weird issues with multiple interactions open
  // at a time.
  interactionUrl(ctx) {
    return `/interaction/${ctx.oidc.uuid}`;
  },
  formats: {
    default: 'opaque',
    AccessToken: 'jwt',
  },
  features: {
    // disable the packaged interactions
    devInteractions: false,

    claimsParameter: true,
    conformIdTokenClaims: true,
    discovery: true,
    encryption: true,
    introspection: true,
    registration: true,
    request: true,
    requestUri: true,
    revocation: true,
    sessionManagement: true,
  },
  routes: {
	authorization: '/cncresource/auth',
    certificates: '/cncresource/certs',
    check_session: '/cncresource/session/check',
    device_authorization: '/cncresource/device/auth',
    end_session: '/cncresource/session/end',
    introspection: '/cncresource/token/introspection',
	registration: '/cncresource/reg',
	revocation: '/cncresource/token/revocation',
    token: '/cncresource/token',
    userinfo: '/cncresource/eduinfo',
	code_verification: '/cncresource/device',
  },
});

const keystore2 = require('./keystore.json');

oidc2.initialize({
  keystore2,
  clients: [
    // reconfigured the foo client for the purpose of showing the adapter working
//    {
//      client_id: 'foo',
//      redirect_uris: ['https://example.com'],
//      response_types: ['id_token token'],
//      grant_types: ['implicit'],
//      token_endpoint_auth_method: 'none',
//    },
	{
		client_id: 'test_oauth_app',
		client_secret: 'super_secret',
		//grant_types: ['client_credentials'],
		grant_types: ['authorization_code'],
		response_types: ['code'],
		redirect_uris: ['https://example.com'],
	}
  ],
}).then(() => {
  // let's work with express here, below is just the interaction definition
  const expressApp = express();
  expressApp.set('trust proxy', true);
  expressApp.set('view engine', 'ejs');
  expressApp.set('views', path.resolve(__dirname, 'views'));

  const parse = bodyParser.urlencoded({ extended: false });

  expressApp.get('/interaction/:grant', async (req, res) => {
    oidc2.interactionDetails(req).then((details) => {
      console.log('see what else is available to you for interaction views', details);

      const view = (() => {
        switch (details.interaction.reason) {
          case 'consent_prompt':
          case 'client_not_authorized':
            return 'interaction';
          default:
            return 'login';
        }
      })();

      res.render(view, { details });
    });
  });

  expressApp.post('/interaction/:grant/confirm', parse, (req, res) => {
    oidc2.interactionFinished(req, res, {
      consent: {},
    });
  });

  expressApp.post('/interaction/:grant/login', parse, (req, res, next) => {
    Account.authenticate(req.body.email, req.body.password)
      .then(account => oidc2.interactionFinished(req, res, {
        login: {
          account: account.accountId,
          acr: '1',
          remember: !!req.body.remember,
          ts: Math.floor(Date.now() / 1000),
        },
        consent: {
          // TODO: remove offline_access from scopes if remember is not checked
        },
      })).catch(next);
  });

    // leave the rest of the requests to be handled by oidc-provider, there's a catch all 404 there
  expressApp.use(oidc2.callback);

  // express listen
  expressApp.listen(3001);
});
*/