import axios from 'axios'

export default function() {

  const config = {
    headers: {
      Accept: 'application/json'
    }
  }

  return axios.get('https://icanhazdadjoke.com', config).then( res => {
    const jokeEl = document.getElementById('joke')
    jokeEl.innerText = res.data.joke
  })

}