const requestGithubToken = credentials => 
  fetch(
    `https://github.com/login/oauth/access_token`,
    {
        method: `POST`,
        headers: {
            `Content-Type`: `application/json`,
            Accept: `application/json`
        },
        body: JSON.stringify(credentials)
    }
  ).then(res => res.json())
   .catch(error => {
      throw new Error(JSON.stringify(error))
  })