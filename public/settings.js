const t = TrelloPowerUp.iframe({
  appKey: '6e5704755a1a0e818ebed84c3c76f83a',
  appName: 'Definition of Done',
});

const listsFilterInput = document.getElementById('lists-filter');

// Fill in the existing board settings
// TODO extract this to common file
async function loadSettings(t) {
  const existingSettings = await t.get('board', 'shared', 'settings');
  return existingSettings && typeof existingSettings === 'object'
    ? existingSettings
    : {};
}

loadSettings(t).then((settings) => {
  listsFilterInput.value = settings.listsFilter;
});

document.getElementById('settings-form').addEventListener('submit', async (event) => {
  // Stop the browser trying to submit the form itself.
  event.preventDefault();

  await t.set('board', 'shared', 'settings', {
    listsFilter: listsFilterInput.value,
  });

  t.closePopup();
});

t.render(() => {
  t.sizeTo('#settings-form').done();
});

