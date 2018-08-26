# Chainlist - Design Decisions and Patterns

The primary focus of this contract was to be robust, simple, and reliable. Due to that, the primary objective was to have the minimal amount of code possible in the application, while still maintaining user security. Below are some design considerations taken when building out the smart contract. [Module 10, Lesson 6](https://courses.consensys.net/courses/course-v1:ConsenSysAcademy+2018DP+1/courseware/6ad0b7c56c8947a2b101cb916896fb9f/edd7e596883247cbb04e5145b3508467/?activate_block_id=block-v1%3AConsenSysAcademy%2B2018DP%2B1%2Btype%40sequential%2Bblock%40edd7e596883247cbb04e5145b3508467) and [This solidity documentation](https://solidity.readthedocs.io/en/develop/common-patterns.html) were used as inspiration on what common patterns to use.

## Failing Loud:
This application uses a lot of require statements where necessary, with lots of exception handling within the actual web part of the application. The goal here to was to not suppress any errors through conditionals, but rather identify and handle errors through proper exception handling. This allows for more bugs to be caught, and overall strengthens the security of the application.

## Withdrawal from Contracts:
I made sure that transfers were the last thing a payable function was able to do as well as the use of proper checks. The goal was to make sure that a function or a caller could not get stuck in a payable function to take advantage and steal funds. This prevents one of the more well-known and infamous attacks in Ethereum.

## Restricting access and Mortal:
Most of the functions had to be public to properly interact with the web application. Since I was trying to keep the contract as light as possible, I did not use many helper functions. If I did, these functions would have been made internal or private. However, I did use the ownable contract from the Zeppelin package in EthPM to limit who could call the selfdestruct() function to only the contractor owner.

## Auto-deprecation:
Since the design of the contract was to run as long as the contract owner wanted it to, auto-deprecation was not used in this solution. However, if I were make an implementation of this more like a crowd-sourcing or beta, where it is meant to shut down after a certain amount of time, then I would consider auto-deprecation. For this project however, it was not needed.

## Circuit Breaker:
Because the smart contract is so simple, I did not implement circuit breakers since I feel that they would add unnecessary complexity. Since there are ways to end the contract in terms of any errors (selfdestruct() which can only be activated by the contract owner), I felt there was enough fail-safes given the simple contract. Most errors that are experienced in the application are due to bugs with the web application, not the smart contract. That, and mixed with the fact I’m trying to keep this more as a PoC rather than a full-scale implementation, made me side with not implementing circuit breakers at this stage.

## State Machine:
This contract does not rely on the utilization of various states to execute certain conditions. This is because this specific contract was primarily constructed with the idea of storage in mind, with the user able to read/write data securely and confidently. The only time there is “staging” in this application is when an item is bought, where it behaves differently since it can no longer be purchased by a user. However, due to the simplicity of this state and how other functions are used to display information from the blockchain, the use of a state machine was determined to be not necessary at this stage.

## Speed Bump:
I wanted to deter users from spamming the creation of stores or articles. I decided there were two ways to do this: giving it a cost to create articles and stores, or using speed bumps to slow down users how call this function too often. For this application, only a payment method of deterrence will be used for both store and article creation. In a later version, using speed bumps would be viable to deter against the spamming of store creation. Speed bumps may also be used for the payment method in the case that a malicious attack occurs, however it is not necessary for this stage of the application.
