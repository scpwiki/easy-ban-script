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
// @version     v0.0.6
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
  margin-left: 0.25em;
  width: 70%;
}

#easy-ban-userscript button {
  display: inline-block;
  padding: 5px 10px 5px 10px;
  text-align: center;
  color: #ffffff;
  background-color: #d9534f;
  border-color: #d43f3a;
}

#easy-ban-userscript button:disabled {
  filter: grayscale(1);
}

#easy-ban-userscript .danger-zone {
  border: 1px darkred solid;
  padding: 0.75em;
  margin: 0.5em;
}
`;

const JS = `
const EASYBAN = {
  escapeHtml: function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  showError: function(message) {
    const element = document.getElementById('easy-ban-userscript-error');
    if (element === null) {
      throw new Error('Could not find error element when trying to set error: ' + message);
    }

    element.innerText = message;
    if (message) {
      throw new Error(message);
    }
  },

  showSuccess: function(message) {
    EASYBAN.showError(''); // clear error
    const win = new OZONE.dialogs.SuccessBox();
    win.content = message;
    win.show();
  },

  showConfirm: function(actionName, content, callback) {
    const win = new OZONE.dialogs.ConfirmationDialog();
    win.content = content;
    win.buttons = [actionName, 'Cancel'];
    win.addButtonListener('Cancel', win.close);
    win.addButtonListener(actionName, callback);
    win.show();
  },

  getUsername: function() {
    const element = document.querySelector('h1.profile-title');
    return element.innerText.trim();
  },

  runRevoke: function(userId) {
    const username = EASYBAN.getUsername();
    EASYBAN.showConfirm(
      'Revoke Membership',
      'Are you sure you want to 👢 <strong style="color: teal">revoke</strong> the user <strong>' + username + '</strong> (user ID ' + userId + ') and remove them from the site?',
      async () => {
        await EASYBAN.runRevokeInner(userId);
        EASYBAN.showSuccess('Member removed')
      },
    );
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

    const username = EASYBAN.getUsername();
    EASYBAN.showConfirm(
      'Apply Ban',
      'Are you sure you want to ❌ <strong style="color: red">ban</strong> the user <strong>' + username + '</strong> (user ID ' + userId + ') with reason:<br><code>' + EASYBAN.escapeHtml(reason) + '</code>',
      async () => {
        await EASYBAN.runBanInner(userId, reason);
        EASYBAN.showSuccess('Ban added');
      },
    );
  },

  runRevokeInner: function(userId) {
    return new Promise((resolve) => {
      const params = {
        action: 'ManageSiteMembershipAction',
        event: 'removeMember',
        user_id: userId,
      };
      OZONE.ajax.requestModule(null, params, resolve);
    });
  },

  runBanInner: async function(userId, reason) {
    // First, revoke so we don't get "user is still a member of the site" errors
    await EASYBAN.runRevokeInner(userId);

    // Then, add the actual ban
    return new Promise((resolve) => {
      const params = {
        action: 'ManageSiteBlockAction',
        event: 'blockUser',
        userId,
        reason,
      };
      OZONE.ajax.requestModule(null, params, resolve);
    });
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

function toggleDangerZone() {
  const checkbox = document.getElementById('easy-ban-userscript-lock');
  const disabled = checkbox.checked;

  const elements = document.querySelectorAll('#easy-ban-userscript .can-lock');
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = disabled;
  }
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
  document.head.appendChild(scriptBlock);

  // Build UI
  const fieldset = document.createElement('fieldset');
  fieldset.id = 'easy-ban-userscript';

  const legend = document.createElement('legend');
  legend.innerText = 'Moderation';

  const lockContainer = document.createElement('div');
  lockContainer.classList.add('danger-zone');
  const lockCheckbox = document.createElement('input');
  lockCheckbox.id = 'easy-ban-userscript-lock';
  lockCheckbox.type = 'checkbox';
  lockCheckbox.checked = true;
  lockContainer.addEventListener('click', () => toggleDangerZone());
  lockContainer.appendChild(lockCheckbox);
  const lockLabel = document.createElement('label');
  lockLabel.for = 'easy-ban-userscript-lock';
  lockLabel.innerText = 'Lock Danger Zone';
  lockContainer.appendChild(lockLabel);

  const revokeButton = document.createElement('button');
  revokeButton.classList.add('can-lock');
  revokeButton.disabled = true;
  revokeButton.innerText = 'Revoke';
  revokeButton.setAttribute('onclick', `EASYBAN.runRevoke(${userId})`);

  const banButton = document.createElement('button');
  banButton.classList.add('can-lock');
  banButton.disabled = true;
  banButton.innerText = 'Ban';
  banButton.setAttribute('onclick', `EASYBAN.runBan(${userId})`);

  const banReason = document.createElement('input');
  banReason.id = 'easy-ban-userscript-ban-reason';
  banReason.classList.add('can-lock');
  banReason.disabled = true;
  banReason.type = 'text';
  banReason.placeholder = 'Ban reason (required)';

  const errorText = document.createElement('div');
  errorText.id = 'easy-ban-userscript-error';
  errorText.classList.add('error-text');

  fieldset.appendChild(legend);
  fieldset.appendChild(lockContainer);
  fieldset.appendChild(revokeButton);
  fieldset.appendChild(banButton);
  fieldset.appendChild(banReason);
  fieldset.appendChild(errorText);

  const parent = document.querySelector('.col-md-9');
  parent.appendChild(fieldset);
}

setup();
