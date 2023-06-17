const requestGithubToken = credentials => 
  fetch(
    'https://github.com/login/oauth/access_token',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(credentials)
    }
  ).then(res => {
    console.log(res)
    console.log(JSON.stringify(res))
    res.json()
  }).
   catch(error => {
      console.log("requestGithubToken error")
      throw new Error(JSON.stringify(error))
  })

const requestGithubUserAccount = token =>
  fetch(
      `https://api.github.com/user`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: `application/json`,
          Authorization: `token ${token}`
        }
      }
  ).then(res => res.json())
  .catch(error => {
    console.log("requestGithubUserAccount error")
    throw new Error(JSON.stringify(error))
})

const authorizeWithGithub = async credentials => {
    console.log(credentials)
    const { access_token } = await requestGithubToken(credentials)
    const githubUser = await requestGithubUserAccount(access_token)

    return { ...githubUser, access_token }
}

module.exports = { authorizeWithGithub }