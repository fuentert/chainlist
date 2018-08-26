var ChainList = artifacts.require("./ChainList.sol");

/**
 * @title ChainListHappyPath
 * @dev This test case goes through an optimal route that a user would go throw. This route is
 * mainly to test that all functions within the smart contract operate as intended for optimal input.
 */
contract('ChainList', function(accounts){
  //set up various vars to create various articles/stores for testing purposes
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];

  var articleStore1 = 1;
  var articleName1 = "article 1";
  var articleDescription1 = "Description for article 1";
  var articlePrice1 = 10;
  var articleNum1 = 1;

  var articleStore2 = 2;
  var articleName2 = "article 2";
  var articleDescription2 = "Description for article 2";
  var articlePrice2 = 20;
  var articleNum2 = 2;

  var articleName3 = "article edited 2";
  var articleDescription3 = "Description for edited article 2";
  var articlePrice3 = 30;
  var articleNum3 = 3;

  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  /**
   * @dev The below test case ensures that upon initialization, the number of articles
   * available articles should be 0. We test this to ensure that there are no memory leaks,
   * and that no articles are added before proper permissions are granted in the effort to
   * prevent potential malicious actions.
   */
  it("should be initialized with empty values", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of articles must be zero");
      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 0, "there shouldn't be any article for sale");
    });
  });

  /**
   * @dev The below test case ensures that an article is successfully added given a
   * set of information. The test ensures that the proper information is found in the article
   * list, and that you can parse through the article as needed to find necessary information. this
   * test also ensures that a event is fired, which is necessary to reload the webpage.
   */
  it("should let us add an article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      //create article
      return chainListInstance.addArticle(articleStore1, articleName1, articleDescription1, web3.toWei(articlePrice1, "ether"), articleNum1, {from: seller});
    }).then(function(receipt) {
      //check the fired event list
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));

      //get list of articles
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 1, "number of articles must be one");

      //ensure that the article is for sale and not bought upon instantiation
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one article for sale");
      assert.equal(data[0].toNumber(), 1, "article if must be 1");

      //check data in article
      return chainListInstance.articles(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], articleStore1, "storeId must be " + articleStore1);
      assert.equal(data[2], seller, "seller must be " + seller);
      assert.equal(data[3], articleName1, "article name must be " + articleName1);
      assert.equal(data[4], articleDescription1, "article name must be " + articleDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
      assert.equal(data[6].toNumber(), articleNum1, "article number must be " + articleNum1);
    });
  });

  /**
   * @dev The below test case ensures that an second article is successfully added given a
   * set of information. The test ensures that the proper information is found in the article
   * list, and that you can parse through the article as needed to find necessary information. This
   * test also ensures that a event is fired, which is necessary to reload the webpage.
   *
   * This test differs from the first in that we are ensuring that a new article is added to the list
   * of articles, and that the original article is not overwritten. We also check that we can parse through
   * and find this new article given it's expected position.
   */
  it("should let us add another article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      //create second article
      return chainListInstance.addArticle(articleStore2, articleName2, articleDescription2, web3.toWei(articlePrice2, "ether"), articleNum2, {from: seller});
    }).then(function(receipt) {
      //check the fired event list
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "event article name must be " + articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "event article price must be " + web3.toWei(articlePrice2, "ether"));

      //get list of articles
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 2, "number of articles must be two");

      //ensure that the article is for sale and not bought upon instantiation
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two articles for sale");
      assert.equal(data[1].toNumber(), 2, "article id must be 2");

      //check data in second article
      return chainListInstance.articles(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "article id must be 2");
      assert.equal(data[1], articleStore2, "storeId must be " + articleStore2);
      assert.equal(data[2], seller, "seller must be " + seller);
      assert.equal(data[3], articleName2, "article name must be " + articleName2);
      assert.equal(data[4], articleDescription2, "article name must be " + articleDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether"), "article price must be " + web3.toWei(articlePrice2, "ether"));
      assert.equal(data[6].toNumber(), articleNum2, "article number must be " + articleNum2);
    });
  });

  /**
   * @dev The below test case ensures that a user can succesfully buy an article. The
   * articles state must be updated to show that its been nought by adding a buyer to the article struct.
   * Funds must also be transfered from the buyer to the seller in a safe manner.
   */
  it("should buy an article", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return chainListInstance.buyArticle(1, articleNum1, {
        from: buyer,
        value: web3.toWei(articlePrice1, "ether")
      });
    }).then(function(receipt){
      //check the fired event list
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "article id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));

      // record balances of buyer and seller after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effect of buy on balances of buyer and seller, accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");

      //ensure that the article is no longer for sale
      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 1, "there should now be only 1 article left for sale");
      assert.equal(data[0].toNumber(), 2, "article 2 should be the only article left for sale");

      //ensure that there are still two articles in the blockchain
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 2, "there should still be 2 articles in total");
    });
  });

  /**
   * @dev The below test case ensures that an article can be correctly edited by a store owner.
   * The test checks that a correct article can be pulled given an article ID, and that all
   * information about the article can be changed except for the seller address and the articleID.
   * These two values must not be chagned for security reasons.
   */
  it("should let us edit an article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      //edit the second article
      return chainListInstance.editArticle(2, articleName3, articleDescription3, web3.toWei(articlePrice3, "ether"), articleNum3, {from: seller});
    }).then(function(receipt) {
      //check the fired event list
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName3, "event article name must be " + articleName3);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice3, "ether"), "event article price must be " + web3.toWei(articlePrice3, "ether"));

      //get list of articles
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 2, "number of articles must be two");

      //ensure that the article is still for sale
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one article for sale");
      assert.equal(data[0].toNumber(), 2, "article id must be 2");

      //check data in second article
      return chainListInstance.articles(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "article id must be 2");
      assert.equal(data[1], articleStore2, "storeId must be " + articleStore2);
      assert.equal(data[2], seller, "seller must be " + seller);
      assert.equal(data[3], articleName3, "article name must be " + articleName3);
      assert.equal(data[4], articleDescription3, "article name must be " + articleDescription3);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice3, "ether"), "article price must be " + web3.toWei(articlePrice3, "ether"));
      assert.equal(data[6].toNumber(), articleNum3, "article number must be " + articleNum3);
    });
  });

  /**
   * @dev The below test case ensures that we can view the list of bought articles. In
   * the case a store owner, admin, or any other user wants to view the list of transactions,
   * this function will provide an easy way for users to find out who bought what article for
   * what price and how many of them at once. This gives us more transparency, which can be used
   * if I decide to expand this applications capabilities.
   */
  it("should let us view the list of bought articles", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      //edit the second article
      return chainListInstance.boughtArticles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], articleStore1, "storeId must be " + articleStore1);
      assert.equal(data[2], seller, "seller must be " + seller);
      assert.equal(data[3], buyer, "buyer must be " + buyer);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
      assert.equal(data[5].toNumber(), articleNum1, "article number must be " + articleNum1);
    });
  });
});
