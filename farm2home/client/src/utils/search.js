const BASE_URL = 'https://farm2home-ai.onrender.com';

export const aiSearch = async (query) => {
  const response = await fetch(
    BASE_URL + '/api/products/search?q=' + encodeURIComponent(query),
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }
  );
  const data = await response.json();
  return data;
};
