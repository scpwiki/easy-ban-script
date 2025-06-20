/*
 * Wikidot easy revoke/ban userscript
 *
 * For installation instructions, see https://05command.wikidot.com/user-scripts
 *
 * Contact: https://www.wikidot.com/account/messages#/new/4598089
 */

// ==UserScript==
// @name        Wikidot easy revoke/ban script
// @description Makes it easier for admins to revoke and ban users
// @version     v0.0.1
// @updateURL   https://github.com/scpwiki/easy-ban-script/raw/main/user-info.user.js
// @downloadURL https://github.com/scpwiki/easy-ban-script/raw/main/user-info.user.js
// @include     https://scp-wiki.wikidot.com/system:user/*
// @include     https://techcheck.wikidot.com/system:user/*
// ==/UserScript==

const CSS = `
#easy-ban-userscript fieldset {
  border: 1px darkred solid;
}

#easy-ban-userscript legend {
  font-weight: bold;
}
`;

function getUserId() {
  const element = document.querySelector('a.btn.btn-default.btn-xs');
  if (element === null) {
    throw new Error('No user selected or invalid DOM');
  }

  const userIdRegex = /https?:\/\/www\.wikidot\.com\/account\/messages#\/new\/(\d+)/;
  const matches = element.href.match(userIdRegex);
  if (matches === null) {
    throw new Error(`Private message href doesn't match regex: ${element.href}`);
  }

  return matches[1];
}

function showSuccess(message) {
  const win = new OZONE.dialogs.SuccessBox();
  win.content = message;
  win.show();
}

function runRevoke(userId) {
  // TODO
}

function runBan(userId) {
  // TODO
}

function setup() {
  // Fetch current user ID
  const userId = getUserId();

  // Add styling
  const styleSheet = document.createElement('style');
  styleSheet.innerText = CSS;
  document.head.appendChild(styleSheet);

  // Add scripts
  // TODO

  // Build UI
  const fieldset = document.createElement('fieldset');
  fieldset.id = 'easy-ban-userscript';

  const legend = document.createElement('legend');
  legend.innerText = 'Moderation';

  const revokeButton = document.createElement('button');
  revokeButton.addEventListener('click', () => runRevoke(userId));

  const banButton = document.createElement('button');
  banButton.addEventListener('click', () => runBan(userId));

  fieldset.appendChild(legend);
  fieldset.appendChild(revokeButton);
  fieldset.appendChild(banButton);

  const parent = document.querySelector('.col-md-9');
  parent.appendChild(fieldset);
}

setup();
