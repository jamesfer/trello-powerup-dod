const t = TrelloPowerUp.iframe({
  appKey: '6e5704755a1a0e818ebed84c3c76f83a',
  appName: 'Definition of Done',
});

t.render(() => {
  document.getElementById('authorize-button').addEventListener('click', () => {
    t.getRestApi().authorize({ scope: 'read,write' }).then(() => {
      t.closePopup();
    }).catch(TrelloPowerUp.restApiError.AuthDeniedError, () => {
      t.closePopup();
    });
  });

  t.sizeTo('#content').done();
});

