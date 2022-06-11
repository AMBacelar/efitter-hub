export function gmail() {
  return 'gmail';
}

export const loadGoogleScript = () => {
  //loads the Google JavaScript Library
  (function () {
    const id = 'google-js';
    const src = 'https://apis.google.com/js/platform.js';

    //we have at least one script (React)
    const firstJs = document.getElementsByTagName('script')[0];

    //prevent script from loading twice
    if (document.getElementById(id)) {
      return;
    }
    const js = document.createElement('script');
    js.id = id;
    js.src = src;
    js.onload = window.onGoogleScriptLoad;
    firstJs.parentNode.insertBefore(js, firstJs);
  })();
};

// =================================================================

/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

/**
 * Callback after api.js is loaded.
 */
export function gapiLoaded() {
  gapi.load('client', intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
export function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

/**
 *  Sign in the user upon button click.
 */
export function handleAuthClick(cb) {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    console.log('hmmm', resp);
    if (resp.access_token) {
      sessionStorage.setItem('token', resp.access_token);
      cb();
      document.getElementById('signout_button').style.visibility = 'visible';
      document.getElementById('authorize_button').innerText = 'Refresh';
      await listLabels();
    }
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

/**
 *  Sign out the user upon button click.
 */
export function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');

    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
  }
}

/**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */
async function listLabels() {
  let response;
  try {
    response = await gapi.client.gmail.users.labels.list({
      userId: 'me',
    });
  } catch (err) {
    return;
  }
  const labels = response.result.labels;
  if (!labels || labels.length == 0) {
    return;
  }
  // Flatten to string to display
  const output = labels.reduce(
    (str, label) => `${str}${label.name}\n`,
    'Labels:\n'
  );
}
