# Chainlist - ConsenSys Certification Final Project

This is a final project submission for the Consensys certification.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. This application is not designed or meant for production or full scale use.

### Prerequisites

Ensure that you have the below applications installed:
* [Node.js and npm](https://nodejs.org/en/) - Used to install and run parts of the application
* [Truffle](https://truffleframework.com/truffle) - Blockchain development framework for Ethereum
* [Ganache](https://truffleframework.com/ganache) - Used to quickly fire up test blockchains for rapid dev and test
* [Metamask](https://metamask.io/) - Used to easily store accounts and make transactions
* [git](https://git-scm.com/downloads) - Versioning package needed to clone the project repository

To install truffle, you can run the following command:
```
npm install truffle
```

Node.js, Ganache, Metamask, and git can be downloaded and installed using the links above.

### Installing and Running the App

This step by step guide will showcase how to get the environment properly running to test and run the app

#### Ensure that all required software and packages are installed
```
npm -v
truffle version
git version
```

If any of the above lines throw errors, see the Prerequisites section on how to install

#### Clone the repository from gitlab
```
git clone https://github.com/fuentert/chainlist.git
```

#### Navigate to the downloaded file location
```
cd YOUR-PATH/chainlist
```

#### Launch Ganache
Ensure that Ganache is set to use port 8545; network ID doesn't matter

If Ganache is using another port, click on the settings button on the top right, modify the port to 8545, then save and restart Ganache

#### Launch Chrome, Firefox, or Edge
DO NOT USE BRAVE. This application uses JS local storage, similar to cookies, which can be problematic on Brave

#### Launch Metamask
Ensure that Metamask is using localhost 8545

If Ganache is using another port, click on the networks button on the top left, and click "Localhost 8545"

If Localhost 8545 is not there, you will have to add it on the Custom RPC option

#### IMPORTANT:
If you're getting errors with the nonce, you will have to reset your account on metamask. Simply go to the settings, scroll to the bottom, and refresh.

#### Compile and migrate the contracts
```
truffle migrate --compile-all --reset --network ganache
```

#### Run the liteserver development server
```
npm run dev
```

You'll now be ready to interact with the Chainlist application

## Running the tests

In order to run the tests, use the below command:

```
truffle tests
```

If you receive an "out of gas error", don't worry, this sometimes happens. Simply run the above command again and it will work.

## Contributing and Pull Requests

All are welcome to pull this code for their use, especially if its related for the ConsenSys course. However, all pull, push, and merge requests require a formal request.

## Versioning

All versioning will be done on github. Please see the tags for versioning.

## Authors

* **Rafael Fuentes** - *Initial work* - [fuentert](https://github.com/fuentert)

## Acknowledgements
I used the skeleton of the app I built from the duration of [this udemy course](https://www.udemy.com/getting-started-with-ethereum-solidity-development/) I purchased and completed nearly a year ago to save time. All key functionality has been modified to meet the needs of this project, and my own desires for how I wanted the app to operate.
