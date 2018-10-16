�]�w clients property

const clients = [{
    client_id: 'test_implicit_app',
    grant_types: ['implicit'],
    response_types: ['id_token'],
    redirect_uris: ['https://testapp/signin-oidc'],
    token_endpoint_auth_method: 'none'
},
{
    client_id: 'test_oauth_app',
    client_secret: 'super_secret',
    //grant_types: ['client_credentials'],
	grant_types: ['authorization_code'],
	response_types: ['code'],
    redirect_uris: ['https://testapp/signin-oidc'],
}];


�w�ˤ覡:
1. �h https://github.com/hujw/oidc-server-example.git �U��

2. ���� npm -i

3. �� 'node_modules' �ؿ�����'oidc-provider'�A�ΤU��(�ڭ̦ۦ��L)���������N


����:
http://localhost:3000/oidc/.well-known/openid-configuration

1. ���o code (���]�O OTkyYTA0Y2MtMTkwYS00YmU5LTk2MjAtOGM0NjM0MmM1ODdiFUY8HoBOenrSc5VVTrDHpBa3CzfRnGjxUvUcXcolWJcR1ddeTVIJudSF61qUKtcEVaC9aUzHMPtISXZ88MmHPw)
   
   [���� eduinfo & userinfo]
   http://localhost:3000/oidc/auth?client_id=test_oauth_app&response_type=code&scope=openid+eduinfo+profile&nonce=foobar

2. �� code �h���o access_token (�z�L chrome postman)
   http://127.0.0.1:3000/oidc/token 


   Header�n��  Authorization: Basic dGVzdF9vYXV0aF9hcHA6c3VwZXJfc2VjcmV0
   Body �n��   
       grant_type: authorization_code
       redirect_uri: https://testapp/signin-oidc
       code: OTkyYTA0Y2MtMTkwYS00YmU5LTk2MjAtOGM0NjM0MmM1ODdiFUY8HoBOenrSc5VVTrDHpBa3CzfRnGjxUvUcXcolWJcR1ddeTVIJudSF61qUKtcEVaC9aUzHMPtISXZ88MmHPw
3. �� access_code �h���o userinfo ���G
   http://localhost:3000/oidc/userinfo?access_token=MjE2MjgyMDItYzMzOS00NjJiLWEzY2UtNjM2MTlmY2RkMTVmhliQ6tuFz71K_MIlRlobMOAYjGztRj8-r3WWRDXaviytHBMyWkGrJCDcTXgGORMSx30h8TLCzn01FuTVfurKVw

   �^�ǵ��G:
{
    "sub": "c2ac2b4a-2262-4e2f-847a-a40dd3c4dcd5",
    "name": "�O�ǥ�",
    "given_name": "�ǥ�",
    "family_name": "�O",
    "email": "student@nchc"
}

4. �h�d eduinfo ���G
   http://localhost:3000/cncresource/eduinfo?access_token=

   �^�ǵ��G:
{
    "sub": "c2ac2b4a-2262-4e2f-847a-a40dd3c4dcd5",
    "titles": {
        "schoolid": "193662",
        "titles": [
            "�ǥ�"
        ]
    },
    "classinfo": {
        "year": "",
        "semester": "",
        "schoolid": "193662",
        "grade": "6",
        "classno": "04",
        "classtitle": "���~�|�Z"
    }
}
   