const defineDonePopup = {
  title: 'Define done',
  url: 'define-done.html',
};

const authorizePopup = {
  title: 'Authorize your trello account',
  url: 'authorize.html',
};

const settingsPopup = {
  title: 'Definition of Done Settings',
  url: 'settings.html',
};

const defaultSettings = {
  listsFilter: [],
};

const badge = {
  text: 'No DoD',
  icon: `${window.location.href}/warning.svg`, // for card front badges only
  color: 'orange',
};

const detailBadge = {
  title: 'Definition of Done', // for detail badges only
  text: 'Add DoD',
  color: 'orange',
  callback: cardBadgeClicked,
};

async function loadSettings(t) {
  const existingSettings = await t.get('board', 'shared', 'settings');
  return existingSettings && typeof existingSettings === 'object'
    ? existingSettings
    : {};
}

const listFilterPatterns = {
  simple: /([^,]+)/,
  escaped: /"((\\"|[^"])+)"/,
  regex: /\/((\\\/|[^/])+)\/([a-z]*)/,
};

function matchStringFilter(value) {
  return value.match(listFilterPatterns.simple)
    || value.match(listFilterPatterns.escaped);
}

function matchRegexFilter(value) {
  return value.match(listFilterPatterns.regex);
}

function parseNextFilter(value) {
  const stringMatch = matchStringFilter(value);
  if (stringMatch) {
    return { length: stringMatch[0].length, filter: stringMatch[1] };
  }

  const regexMatch = matchRegexFilter(value);
  if (regexMatch) {
    return { length: regexMatch[0].length, filter: new RegExp(regexMatch[1], regexMatch[2]) }
  }

  return null;
}

function parseListsFilter(value) {
  let filters = [];
  let remainingString = value;
  while (remainingString.length) {
    // Find the next filter from the string
    const nextMatch = parseNextFilter(remainingString);
    if (!nextMatch) {
      break;
    }

    // Add the filter to the list and update the remaining string
    filters.push(nextMatch.filter);
    remainingString = remainingString.slice(nextMatch.length);

    // Strip the remaining spaces and commas from the string
    remainingString = remainingString.replace(/^[\s,]*/, '');
  }
  return filters;
}

function deserializeSettings(settings) {
  return {
    listsFilter: parseListsFilter(settings.listsFilter),
  };
}

async function getSettings(t) {
  return {
    ...defaultSettings,
    ...deserializeSettings(await loadSettings(t)),
  };
}

function listNamePassesFilters(listName, filters) {
  if (filters.length === 0) {
    return true;
  }

  const trimmedListName = listName.trim();
  return filters.some(filter => (
    filter instanceof RegExp ? filter.test(trimmedListName) : filter === listName
  ));
}

async function shouldShowBadge(t) {
  const settings = await getSettings(t);
  const { name } = await t.list('name');
  if (!listNamePassesFilters(name, settings.listsFilter)) {
    return false;
  }

  const { desc } = await t.card('desc');
  return !/^[^a-z]*(dod|definition of done|done):.*\w.*$/im.test(desc);
}

function cardBadgeClicked(t) {
  return t.getRestApi()
    .isAuthorized()
    .then((isAuthorized) => t.popup(isAuthorized ? defineDonePopup : authorizePopup));
}

async function getCardBadges(t) {
  return t.memberCanWriteToModel('card') && await shouldShowBadge(t) ? [badge] : []
}

async function getCardDetailBadges(t) {
  return t.memberCanWriteToModel('card') && await shouldShowBadge(t) ? [detailBadge] : [];
}

function showSettingsPopup(t) {
  return t.popup(settingsPopup);
}

function logRejections(fn) {
  return (...args) => fn(...args).catch((error) => {
    (console.error || console.log)(error);
    throw error;
  });
}

TrelloPowerUp.initialize(
  {
    'card-badges': logRejections(getCardBadges),
    'card-detail-badges': logRejections(getCardDetailBadges),
    'show-settings': logRejections(showSettingsPopup),
  },
  {
    appKey: '6e5704755a1a0e818ebed84c3c76f83a',
    appName: 'Definition of Done',
  },
);
