# Chainlist - Code Structure to Avoid Common Attacks

Several checks and enhancements have been made in this smart contract to lower the possibility of attacks, and to increase the security in this application as much as possible. Below are the checks and changes made listed by popular security/attack type. [This checklist](https://www.kingoftheether.com/contract-safety-checklist.html) was used to ensure that most common attacks and errors were addressed in the design and implementation of this contract.

## Logic Bugs:
Various test cases have been made and tested for each method in this application, using edge cases when possible. This ensures that all smart contracts do not contained any logic errors. Any errors found in the application are most likely a result of the actual webpage, but not with the actual smart contract.

## Integer Overflow:
Tests were made to determine the optimal uint size for each uint variable. For small scale PoC purposes, the uint levels are optimal. If this application where to grow, the size of several uints may have to change.

## Exposed Functions:
The functions used are where tested to determine an optimal level for PoC purposes. Functions that should only be used by the contract owner have been modified to only been seen and usable by the owner of the contract. Other functions have enough visibility for other users to access the contract and its functions. Internal and private visibility were preferred, with only functions and variables needing to be made public done so after a thorough examination.

## Exposed Secrets:
This contract does not rely on secrets or other types of keys to operate. All data is fair and welcome for users to view.

## Denial of Service / Dust Spam / Gas Limits:
To prevent users from spamming the creation of new stores and addition of new store owners, a fee has been placed on this action. This action is aimed to limit how often store owners and stores are added onto the chain. Later versions will force owners to pay small fees when editing articles as well. To limit the amount of gas used in certain functions, looping was minimalized to only when necessary. This limits the amount of gas used in the application. While the number of articles will grow which will in turn increase in gas usage over time, the looping mechanism was optimized to ensure that the gas cost will remain low until large scale usage is seen. This was done using view functions to reduce the amount of gas actually required for certain functions. These tests were performed in remix which gave accurate estimates on gas usage per iteration of these types of functions. According to remix, gas will only become a problem when thousands of articles are introduced into the system.

## External Calls:
Externals calls are limited, except for the owner.sol contract from EthPM. The code was still checked and validated to ensure that no suspicious code was in the contract before using.

##Reentrancy
Originally I was going to use the ReentrancyGuard file in the EthPM package Zeppelin before I decided that may be unnecessary for this application. Instead, I ensured that all internal work was done first before any transfers were done in the Payable method. Given the size of the project, this should achieve the same affect. If this project were to grow with more payable methods, then I would utilize this solidity function to this contract. If I wanted to implement ReentrancyGuard, I would have extended it much like I did with owner, except add the nonReentrant modifier onto all payable methods.

## Conditions and requirements on payments:
Various require statements were used in the pay method to ensure that no unnecessary or untrustworthy payments would be made.

## Timestamp Dependence:
Timestamps were not used in this contract, meaning that miners cannot use this manipulate the contract
