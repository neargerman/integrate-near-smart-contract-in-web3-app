import { providers } from 'near-api-js';

import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { Buffer } from "buffer";


//Additionally we need to import a css-file to bé ablet to show the modal
import '@near-wallet-selector/modal-ui/styles.css';


const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

// Wallet that simplifies using the wallet selector
export class Wallet {

  constructor({ createAccessKeyFor = undefined, network = 'testnet' }) {
    this.accountId = '';
    this.selector = setupWalletSelector({
      network: network,
      modules: [setupMyNearWallet(), setupHereWallet()],
    });
  }

  // To be called when the website loads
  async startUp() {
    const walletSelector = await this.selector;
    const isSignedIn = walletSelector.isSignedIn();

    if (isSignedIn) {
      this.wallet = await walletSelector.wallet();
      this.accountId = walletSelector.store.getState().accounts[0].accountId;
    }
    return isSignedIn;
  }

  // Sign-in method
  async signIn() {
    const description = 'Please select a wallet to sign in.';
    const modal = setupModal(await this.selector, { contractId: this.createAccessKeyFor, description });
    modal.show();
  }

  // Sign-out method
  async signOut() {
    await this.wallet.signOut();
    this.wallet = this.accountId = this.createAccessKeyFor = null;
    window.location.replace(window.location.origin + window.location.pathname);
  }

   /**
   * Makes a read-only call to a contract
   * @param {string} contractId - the contract's account id
   * @param {string} method - the method to call
   * @param {Object} args - the arguments to pass to the method
   * @returns {Promise<JSON.value>} - the result of the method call
   */

   async viewMethod({ contractId, method, args = {} }) {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    let res = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      signerId: this.accountId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });
    return JSON.parse(Buffer.from(res.result).toString());
  }


  /**
   * Makes a change call to a contract
   * @param {string} contractId - the contract's account id
   * @param {string} method - the method to call
   * @param {Object} args - the arguments to pass to the method
   * @param {string} gas - the amount of gas to use
   * @param {string} deposit - the amount of yoctoNEAR to deposit
   * @returns {Promise<Transaction>} - the resulting transaction
   */
  async callMethod({ contractId, method, args = {}, gas = THIRTY_TGAS, deposit = NO_DEPOSIT }) {

    // Sign a transaction with the "FunctionCall" action
    return await this.wallet.signAndSendTransaction({
      signerId: this.accountId,
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    });
  }

  
}