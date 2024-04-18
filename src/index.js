import { Wallet } from './near-wallet.js';
const wallet = new Wallet({ network: 'testnet' });

// Setup on page load
window.onload = async () => {
  let isSignedIn = await wallet.startUp();
  isSignedIn ? signedInUI() : signedOutUI();
  getCounterValue();
};

document.querySelector('#sign-in-button').onclick = () => { wallet.signIn(); };
document.querySelector('#sign-out-button').onclick = () => { wallet.signOut(); };


// UI: Hide signed-in elements
function signedOutUI() { hide('#signed-in'); hide('#sign-out-button'); }

// UI: Hide signed-out elements
function signedInUI() {
  hide('#signed-out');
  hide('#sign-in-button');

  document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
    el.innerText = wallet.accountId;
  });
}

function getCounterValue() {
  wallet.viewMethod({contractId : 'near-deutsch.testnet', method: 'get_num'}).then(val => {
      document.getElementById('counter-value').innerText = val;
  });
}

function incrementCounterValue() {
  wallet.callMethod({contractId : 'near-deutsch.testnet', method: 'increment'}).then(() => getCounterValue());
}


document.querySelector('#increment-counter-value').onclick = () => { incrementCounterValue(); };

function hide(id) {
  document.querySelectorAll(id).forEach(el => el.style.display = 'none');
}