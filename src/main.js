// Connects to NEAR and provides `near`, `walletAccount` and `contract` objects in `window` scope
async function connect() {
  // Initializing connection to the NEAR node.
  window.near = await nearlib.connect(Object.assign(nearConfig, { deps: { keyStore: new nearlib.keyStores.BrowserLocalStorageKeyStore() } }));

  // Needed to access wallet login
  window.walletAccount = new nearlib.WalletAccount(window.near);

  // Initializing our contract APIs by contract name and configuration.
  //   window.contract = await near.loadContract(nearConfig.contractName, {
  //     viewMethods: ['getCounter'],
  //     changeMethods: ['incrementCounter', 'decrementCounter', 'resetCounter'],
  //     sender: window.walletAccount.getAccountId()
  //   });
  // }

  // src/main.js
  async function connect() {
    // Initializing connection to the NEAR node.
    window.near = await nearlib.connect(Object.assign(nearConfig, { deps: { keyStore: new nearlib.keyStores.BrowserLocalStorageKeyStore() } }));

    // Needed to access wallet login
    window.walletAccount = new nearlib.WalletAccount(window.near);

    // Initializing our contract APIs by contract name and configuration.
    window.contract = new nearlib.Contract(
      window.walletAccount.getAccountId(),
      nearConfig.contractName, {
        viewMethods: ["getResponse"],
        changeMethods: ["setResponse"]
      });

    window.contract = await near.loadContract(nearConfig.contractName, {
      viewMethods: ["getResponse", "getResponseByKey"],
      changeMethods: ["setResponse", "setResponseByKey"],
      sender: window.walletAccount.getAccountId()
    });

  }

  async function makeApiCallAndSave() {
    // //for visibility purposes
    // console.log('calling api endpoint')
    // //calling endpoint
    // let response = await fetch('https://api.coindesk.com/v1/bpi/currentprice/btc.json');
    // let body = await response.json();
    // //stripping only the data we want from the API response
    // let data = body.bpi.USD.rate
    // //Saving the data to the blockchain by calling the Oracle Contracts setResponse function
    // await contract.setResponse({ apiResponse: data });
    // // Check to see if the data was saved properly
    // let apiResponse = await contract.getResponse();
    // console.log(`${apiResponse} is the API response`);

    // getting API Params from the Oracle
    let params = await contract.getOracleQueryParams();
    // logging for visibility
    console.log(params.uid, params.url, params.callback)
    // making the api call
    let response = await fetch(params.url);
    let body = await response.json();
    // stripping the correct value based off of the string key
    let value = params.callback.split('.').reduce((p, c) => p && p[c] || "did not find the correct data", body)
    // logging for visibility
    let status = document.getElementById("status")
    console.log('saving value to the blockchain')
    status.innerText = "saving value to the blockchain"
    // saving the response to the blockchain
    await contract.setResponseByKey({ key: params.uid, apiResponse: value });
    status.innerText = "api response saved"
    setTimeout(() => status.innerText = "", 1500)
  }


  async function fetchAndDisplayResponse() {
    // getting the response from the blockchain
    let apiResponse = await contract.getResponse();
    // logging on the console for some feedback
    console.log(apiResponse);
    // Displaying the message once we have it.
    document.getElementById('response').innerText = apiResponse;
  }

  async function saveResponseByKey() {
    let key = document.getElementById("key-input").value
    let response = document.getElementById("key-response-input").value
    let status = document.getElementById("status")
    await contract.setResponseByKey({ key: key, newResponse: response })
    status.innerText = "api response saved"
    setTimeout(() => status.innerText = "", 1500)
  }

  async function fetchResponseByKey() {
    let uid = document.getElementById("key-query-input").value
    let response = await contract.getResponseByKey({ key: uid })
    document.getElementById("response-by-key").innerText = response
  }

  async function doInitContract() {
    window.contract = await near.loadContract(nearConfig.contractName, {
      viewMethods: ["getResponse", "getResponseByKey", "getOracleQueryParams"],
      changeMethods: ["setResponse", "setResponseByKey", "setOracleQueryParams"],
      sender: window.walletAccount.getAccountId()
    });
  }

  async function saveOracleQueryParams() {
    let url = document.getElementById('url').value
    let uid = document.getElementById('uid').value
    let callback = document.getElementById('callback').value
    let status = document.getElementById("status")
    // logging for visibility
    console.log('sending Params to the blockchain')
    status.innerText = "sending Params to the blockchain"

    await contract.setOracleQueryParams({ url: url, uid: uid, callback, callback });
    // logging for visibility
    console.log('Params saved to the blockchain')
    status.innerText = "Params saved to the blockchain"
    setTimeout(() => status.innerText = "", 1500)
  }


  async function doInitContract() {
    window.contract = await near.loadContract(nearConfig.contractName, {
      viewMethods: ["getResponse", "getResponseByKey", "getOracleQueryParams"],
      changeMethods: ["setResponse", "setResponseByKey", "setOracleQueryParams", "finalizeBet"],
      sender: window.walletAccount.getAccountId()
    });
  }

  async function finalizeBet() {
    await contract.finalizeBet()
    let outcome = await contract.getResponseByKey({ key: "betOutcome" })
    console.log(outcome)
    document.getElementById("betOutcome").innerText = outcome
  }

  function updateUI() {
    if (!window.walletAccount.getAccountId()) {
      Array.from(document.querySelectorAll('.sign-in')).map(it => it.style = 'display: block;');
    } else {
      Array.from(document.querySelectorAll('.after-sign-in')).map(it => it.style = 'display: block;');
      contract.getCounter().then(count => {
        document.querySelector('#show').classList.replace('loader', 'number');
        document.querySelector('#show').innerText = count == undefined ? 'calculating...' : count;
        document.querySelector('#left').classList.toggle('eye');
        document.querySelectorAll('button').forEach(button => button.disabled = false);
        if (count >= 0) {
          document.querySelector('.mouth').classList.replace('cry', 'smile');
        } else {
          document.querySelector('.mouth').classList.replace('smile', 'cry');
        }
        if (count > 20 || count < -20) {
          document.querySelector('.tongue').style.display = 'block';
        } else {
          document.querySelector('.tongue').style.display = 'none';
        }
      });
    }
  }

  // // counter method
  // let value = 1;

  // document.querySelector('#plus').addEventListener('click', () => {
  //   document.querySelectorAll('button').forEach(button => button.disabled = true);
  //   document.querySelector('#show').classList.replace('number', 'loader');
  //   document.querySelector('#show').innerText = '';
  //   contract.incrementCounter({ value: value }).then(updateUI);
  // });
  // document.querySelector('#minus').addEventListener('click', () => {
  //   document.querySelectorAll('button').forEach(button => button.disabled = true);
  //   document.querySelector('#show').classList.replace('number', 'loader');
  //   document.querySelector('#show').innerText = '';
  //   contract.decrementCounter({ value: value }).then(updateUI);
  // });
  // document.querySelector('#a').addEventListener('click', () => {
  //   document.querySelectorAll('button').forEach(button => button.disabled = true);
  //   document.querySelector('#show').classList.replace('number', 'loader');
  //   document.querySelector('#show').innerText = '';
  //   contract.resetCounter().then(updateUI);
  // });
  // document.querySelector('#c').addEventListener('click', () => {
  //   document.querySelector('#left').classList.toggle('eye');
  // });
  // document.querySelector('#b').addEventListener('click', () => {
  //   document.querySelector('#right').classList.toggle('eye');
  // });
  // document.querySelector('#d').addEventListener('click', () => {
  //   document.querySelector('.dot').classList.toggle('on');
  //   if (document.querySelector('.dot').classList.contains('on')) {
  //     value = 10;
  //   } else {
  //     value = 1;
  //   }
  // });

  // Log in user using NEAR Wallet on "Sign In" button click
  document.querySelector('.sign-in .btn').addEventListener('click', () => {
    walletAccount.requestSignIn(nearConfig.contractName, 'NEAR Studio Counter');
  });

  document.querySelector('.sign-out .btn').addEventListener('click', () => {
    walletAccount.signOut();
    // TODO: Move redirect to .signOut() ^^^
    window.location.replace(window.location.origin + window.location.pathname);
  });

  window.nearInitPromise = connect()
    .then(updateUI)
    .catch(console.error);
