// https://seapi.c4ldas.com.br/top/c4ldas?amount=5

const axios = require('axios').default
const express = require('express')
const app = express()
app.use(express.static(__dirname))

// Schedule
// const schedule = require('./schedule')
// app.use('/schedule', schedule)

const seURL = 'https://api.streamelements.com/kappa'

/*************************************************
//                   Routes                     //
*************************************************/

// Home page
// Usage: https://seapi.c4ldas.com.br
app.get('/', async (req, res) => {
  res.status(200).send('<h1>Hello!</h1>')
})


// Getting the top users on Streamelements leaderboard
// Usage: https://seapi.c4ldas.com.br/top/c4ldas?amount=5
app.get('/top/:username', async (req, res) => {

  const amount = req.query.amount;
  const accountId = await getAccountId(req.params.username);

  if (amount == 0 || amount > 1000) {
    res.status(400).send(`Minimum amount: 1. Max amount: 1000`)
    return
  }

  if (accountId.code == 404) {
    res.status(404).send(`Channel not found`)
    console.log('Account Id for that username not found')
    return
  }

  const topUser = await getTopLeaderboard(accountId, amount)
  console.log(`Channel: ${req.params.username} - Users: ${topUser}`)
  res.status(200).send(`${topUser}`)
})


// Testing delay to timeout command - Streamelements bot timeouts the command in 10 seconds
// Usage: https://seapi.c4ldas.com.br/test?t=5
app.get('/teste', async (req, res) => {
  const seconds = req.query.t;
  const message = "hello, how are you?";
  
  setTimeout(() => {
    res.send(message)
  }, seconds * 1000)
})


/*************************************************
//                 Functions                    //
*************************************************/

// Get Account ID of username
async function getAccountId(username) {
  try {
    const accountIdRequest = await axios.get(`${seURL}/v2/channels/${username}`, {
      timeout: 1000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    const accountId = await accountIdRequest.data._id
    return accountId
  } catch (error) {
    console.log(error.response.data)
    return { error: error.response.data.message, code: error.response.data.statusCode }
  }
}


// Get top leaderboard users based on account ID
async function getTopLeaderboard(accountId, amount = 1) {
  try {
    const topUsernameRequest = await axios.get(`${seURL}/v2/points/${accountId}/top?limit=${amount}&offset=0`, {
      timeout: 1000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    const usersArray = await topUsernameRequest.data.users
    const totalUsers = []

    usersArray.forEach(element => {
      totalUsers.push(element.username)
    })

    const topUsernames = totalUsers.join(', ')
    return topUsernames


  } catch (error) {
    console.log(error.response.data)
    return { error: error.response.data.message, code: error.response.data.statusCode }
  }
}






app.listen(8000, () => console.log('listening'))




