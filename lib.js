const fetch = require('node-fetch')

const requestGithubToken = credentials => {
  console.log("-----requestGithubToken")
  fetch(
    'https://github.com/login/oauth/access_token',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(credentials)
    }
  ).then(res => {
    console.log(res.status)
    console.log(JSON.stringify(res))
    res.json()
  }).catch(error => {
    console.log("requestGithubToken error")
    throw new Error(JSON.stringify(error))
  })
}

const requestGithubUserAccount = token => {
  console.log("-----requestGithubUserAccount")
  fetch(
      `https://api.github.com/user`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
  ).then(res => res.json())
}

const authorizeWithGithub = async credentials => {
    const { access_token } = await requestGithubToken(credentials)
    const githubUser = await requestGithubUserAccount(access_token)

    return { ...githubUser, access_token }
}

module.exports = { authorizeWithGithub }