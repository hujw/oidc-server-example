設定 clients property

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


安裝方式:
1. 去 https://github.com/hujw/oidc-server-example.git 下載

2. 執行 npm -i

3. 把 'node_modules' 目錄中的'oidc-provider'，用下載(我們自行改過)的版本取代


測試:
http://localhost:3000/oidc/.well-known/openid-configuration

1. 取得 code (假設是 OTkyYTA0Y2MtMTkwYS00YmU5LTk2MjAtOGM0NjM0MmM1ODdiFUY8HoBOenrSc5VVTrDHpBa3CzfRnGjxUvUcXcolWJcR1ddeTVIJudSF61qUKtcEVaC9aUzHMPtISXZ88MmHPw)
   
   [模擬 eduinfo & userinfo]
   http://localhost:3000/oidc/auth?client_id=test_oauth_app&response_type=code&scope=openid+eduinfo+profile&nonce=foobar

2. 拿 code 去取得 access_token (透過 chrome postman)
   http://127.0.0.1:3000/oidc/token 


   Header要有  Authorization: Basic dGVzdF9vYXV0aF9hcHA6c3VwZXJfc2VjcmV0
   Body 要有   
       grant_type: authorization_code
       redirect_uri: https://testapp/signin-oidc
       code: OTkyYTA0Y2MtMTkwYS00YmU5LTk2MjAtOGM0NjM0MmM1ODdiFUY8HoBOenrSc5VVTrDHpBa3CzfRnGjxUvUcXcolWJcR1ddeTVIJudSF61qUKtcEVaC9aUzHMPtISXZ88MmHPw
3. 拿 access_code 去取得 userinfo 結果
   http://localhost:3000/oidc/userinfo?access_token=MjE2MjgyMDItYzMzOS00NjJiLWEzY2UtNjM2MTlmY2RkMTVmhliQ6tuFz71K_MIlRlobMOAYjGztRj8-r3WWRDXaviytHBMyWkGrJCDcTXgGORMSx30h8TLCzn01FuTVfurKVw

   回傳結果:
{
    "sub": "c2ac2b4a-2262-4e2f-847a-a40dd3c4dcd5",
    "name": "是學生",
    "given_name": "學生",
    "family_name": "是",
    "email": "student@nchc"
}

4. 去查 eduinfo 結果
   http://localhost:3000/cncresource/eduinfo?access_token=

   回傳結果:
{
    "sub": "c2ac2b4a-2262-4e2f-847a-a40dd3c4dcd5",
    "titles": {
        "schoolid": "193662",
        "titles": [
            "學生"
        ]
    },
    "classinfo": {
        "year": "",
        "semester": "",
        "schoolid": "193662",
        "grade": "6",
        "classno": "04",
        "classtitle": "六年四班"
    }
}
   