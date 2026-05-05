// thin wrapper around psa public api
// requires PSA_ACCESS_TOKEN env var, register at psacard.com/publicapi

const axios = require('axios');

const PSA_BASE_URL = 'https://api.psacard.com/publicapi';

// fetches cert metadata: card name, set, year, grade, population, etc.
// response is wrapped in { PSACert: {...} }
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

// fetches scan images for given cert
// returns array of { IsFrontImage, ImageURL }
// many certs return empty array if psa has no scans on file
async function getImagesByCertNumber(certNumber) {
  const response = await axios.get(
    `${PSA_BASE_URL}/cert/GetImagesByCertNumber/${certNumber}`,
    {
      headers: {
        Authorization: `bearer ${process.env.PSA_ACCESS_TOKEN}`
      }
    }
  );

  return response.data;
}

module.exports = {
  getCertByNumber,
  getImagesByCertNumber
};
