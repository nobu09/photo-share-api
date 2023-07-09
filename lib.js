const fetch = require('node-fetch')

const requestGithubToken = async credentials => {
  try {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
          },
          body: JSON.stringify(credentials)
      })

      const data = await response.json();
      return data;
  } catch(error) {
    console.log("requestGithubToken error")
    throw new Error(JSON.stringify(error))
  }
}

const requestGithubUserAccount = async token => {
  try {
    const response = await fetch(
      `https://api.github.com/user`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${token}`,
          Accept: 'application/json',
        }
      })

    const data = await response.json();
    return data;
  } catch(error) {
    console.log("requestGithubUserAccount error")
    throw new Error(JSON.stringify(error))
  }
}

const authorizeWithGithub = async credentials => {
    const { access_token } = await requestGithubToken(credentials)
    const githubUser = await requestGithubUserAccount(access_token)

    return { ...githubUser, access_token }
}

module.exports = { authorizeWithGithub }