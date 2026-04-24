const axios = require('axios');

const PSA_BASE_URL = 'https://api.psacard.com/publicapi';

async function getCertByNumber(certNumber) {
  const response = await axios.get(
    `${PSA_BASE_URL}/cert/GetByCertNumber/${certNumber}`,
    {
      headers: {
        Authorization: `bearer ${process.env.PSA_ACCESS_TOKEN}`
      }
    }
  );

  return response.data;
}

module.exports = {
  getCertByNumber
};