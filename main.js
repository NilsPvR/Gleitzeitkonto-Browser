const axios = require('axios');

axios
  .get('https://google.com')
  .then(res => {
    console.log(`Status code: ${res.status} from ${res.config.url}`);
  })
  .catch(error => {
    console.error(error);
  });