const t = TrelloPowerUp.iframe({
  appKey: '6e5704755a1a0e818ebed84c3c76f83a',
  appName: 'Definition of Done',
});

function generateQueryParams(params) {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

function callApi(method, path, token, params) {
  const paramString = generateQueryParams({
    ...params,
    token,
    key: '6e5704755a1a0e818ebed84c3c76f83a',
  });
  const authorizedPath = path.includes('?') ? `${path}&${paramString}` : `${path}?${paramString}`;
  return fetch(authorizedPath, { method });
}

function updateCard(token, id, details) {
  return callApi('PUT', `https://api.trello.com/1/cards/${id}`, token, details);
}

document.getElementById('definition-of-done-form').addEventListener('submit', async (event) => {
  // Stop the browser trying to submit the form itself.
  event.preventDefault();

  const token = await t.getRestApi().getToken();
  const { id, desc } = await t.card('id', 'desc');
  const dod = document.getElementById('definition-of-done').value;
  const response = await updateCard(token, id, { desc: `DoD: ${dod}\n\n${desc}` });

  if (response.ok) {
    const json = await response.json();
    console.log(json);
    t.closePopup();
  } else {
    const json = await response.json();
    alert('Failed to update card ' + json);
  }
});

t.render(() => {
  t.sizeTo('#definition-of-done-form').done();
});

