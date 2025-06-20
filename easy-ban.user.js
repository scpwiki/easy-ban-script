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
#easy-ban-userscript {
  border: 1px darkred solid;
  padding: 0.5em;
}

#easy-ban-userscript legend {
  font-weight: bold;
}

#easy-ban-userscript-error {
  color: red;
  font-weight: bold;
}

#easy-ban-userscript-ban-reason {
  margin-top: 0.25em;
  width: 80%;
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

function showError(message) {
  const element = document.getElementById('easy-ban-userscript-error');
  if (element === null) {
    throw new Error(`Could not find error element when trying to set error: ${message}`);
  }

  element.innerText = message;
  throw new Error(message);
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
  const reasonElement = document.getElementById('easy-ban-userscript-ban-reason');
  if (reasonElement === null) {
    throw new Error('Cannot find ban reason element');
  }

  const reason = reasonElement.value;
  if (!reason.trim()) {
    // Require a ban reason
    showError('No ban reason provided');
  }

  const params = {
    action: 'ManageSiteBlockAction',
    event: 'blockUser',
    userId,
    reason,
  };
  OZONE.ajax.requestModule(null, params, () => showSuccess('Ban added'));
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
  revokeButton.innerText = 'Revoke';

  const banButton = document.createElement('button');
  banButton.addEventListener('click', () => runBan(userId));
  banButton.innerText = 'Ban';

  const banReasonContainer = document.createElement('div');
  const banReason = document.createElement('input');
  banReason.id = 'easy-ban-userscript-ban-reason';
  banReason.type = 'text';
  banReason.placeholder = 'Ban reason (required)';
  banReasonContainer.appendChild(banReason);

  const errorText = document.createElement('div');
  errorText.id = 'easy-ban-userscript-error';
  errorText.classList.add('error-text');

  fieldset.appendChild(legend);
  fieldset.appendChild(revokeButton);
  fieldset.appendChild(banButton);
  fieldset.appendChild(banReasonContainer);
  fieldset.appendChild(errorText);

  const parent = document.querySelector('.col-md-9');
  parent.appendChild(fieldset);
}

setup();
