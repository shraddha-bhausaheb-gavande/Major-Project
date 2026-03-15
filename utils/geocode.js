const axios = require('axios');

module.exports.geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'WanderlustApp/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    return { lat: 20.5937, lng: 78.9629 }; // Default to India center
  } catch (error) {
    console.error('Geocoding error:', error);
    return { lat: 20.5937, lng: 78.9629 };
  }
};
