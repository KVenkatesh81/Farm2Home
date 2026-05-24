const BASE_URL = 'https://bug-free-yodel-4j94ww6v69q7c56-5000.app.github.dev';

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
