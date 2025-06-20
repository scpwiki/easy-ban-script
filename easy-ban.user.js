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

const JS = `
const EASYBAN = {
  showError: function(message) {
    const element = document.getElementById('easy-ban-userscript-error');
    if (element === null) {
      throw new Error('Could not find error element when trying to set error: ' + message);
    }

    element.innerText = message;
    throw new Error(message);
  },

  showSuccess: function(message) {
    const win = new OZONE.dialogs.SuccessBox();
    win.content = message;
    win.show();
  },

  runRevoke: function(userId) {
    // TODO
  },

  runBan: function(userId) {
    const reasonElement = document.getElementById('easy-ban-userscript-ban-reason');
    if (reasonElement === null) {
      throw new Error('Cannot find ban reason element');
    }

    const reason = reasonElement.value;
    if (!reason.trim()) {
      // Require a ban reason
      EASYBAN.showError('No ban reason provided');
    }

    const params = {
      action: 'ManageSiteBlockAction',
      event: 'blockUser',
      userId,
      reason,
    };
    OZONE.ajax.requestModule(null, params, () => EASYBAN.showSuccess('Ban added'));
  },
};
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

function setup() {
  // Fetch current user ID
  const userId = getUserId();

  // Add styling
  const styleSheet = document.createElement('style');
  styleSheet.innerHTML = CSS;
  document.head.appendChild(styleSheet);

  // Add scripts
  const scriptBlock = document.createElement('script');
  scriptBlock.type = 'text/javascript';
  scriptBlock.innerHTML = JS;
  document.body.appendChild(scriptBlock);

  // Build UI
  const fieldset = document.createElement('fieldset');
  fieldset.id = 'easy-ban-userscript';

  const legend = document.createElement('legend');
  legend.innerText = 'Moderation';

  const revokeButton = document.createElement('button');
  revokeButton.innerText = 'Revoke';
  revokeButton.setAttribute('onclick', `EASYBAN.runRevoke(${userId})`);

  const banButton = document.createElement('button');
  banButton.innerText = 'Ban';
  banButton.setAttribute('onclick', `EASYBAN.runBan(${userId})`);

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
