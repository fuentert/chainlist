// contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

/**
 * @title ChainListExceptions
 * @dev This test case tests primarily for bad input, and ensures that proper exceptions
 * are thrown and handled as intended. Testing for bad input is as important as testing
 * for good input.
 */
contract("ChainList", function(accounts){
  //set up various vars to create various articles/stores for testing purposes
  var chainListInstance;
  var storeId = 1;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1";
  var articleDescription = "Description for article 1";
  var articlePrice = 10;
  var articleNum = 1;

  /**
   * @dev The below test case ensures that on a fresh instance, there are no articles. When
   * a user tries to buy an article when the list of articles is empty, then an error will be thrown
   * and handled correctly. This test ensures the the error is thrown and handled.
   */
  it("should throw an exception if you try to buy an article when there is no article for sale yet", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      //try to buy an article when there are none
      return chainListInstance.buyArticle(1, articleNum, {
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail)
    .catch(function(error){
      //ensure that an error was thrown
      assert(true);
    }).then(function() {
      //check that there are no articles
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of articles must be 0");
    });
  });

  /**
   * @dev The below test case ensures that a user cannot buy an article that doesn't
   * exist in the list of articles. We want to make sure that a user cannot buy an article
   * without the correct article ID. We also want to check that there's still articles available
   * when we run this test as this input may be experienced with and without an empty article list.
   */
  it("should throw an exception if you try to buy an article that doesn't exist", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      //add a new article
      return chainListInstance.addArticle(storeId, articleName, articleDescription, web3.toWei(articlePrice, "ether"), articleNum, {from:seller});
    }).then(function(receipt) {

      //try to buy an article with a bad articleID
      return chainListInstance.buyArticle(2, articleNum, {from: seller, value:web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {

      //check that the there's an article at ID 1, and validate it's info
      return chainListInstance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1].toNumber(), storeId, "store id must be " + storeId);
      assert.equal(data[2], seller, "seller must be " + seller);
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
      assert.equal(data[6].toNumber(), articleNum, "article num must be " + articleNum);
    });
  });

  /**
   * @dev The below test case ensures that a user cannot buy too many of an article that is
   * listed for sale. We want to ensure that users cannot buy things that do not exist. This means
   * that we need to check that users cannot buy items that are not for sale yet, as well as no
   * longer for sale. Checking that the available number of articles does not exceed the bought
   * articles is critical for this application's design.
   */
  it("should throw an exception if you try to buy too many articles", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      //add a new article
      return chainListInstance.addArticle(storeId, articleName, articleDescription, web3.toWei(articlePrice, "ether"), articleNum, {from:seller});
    }).then(function(receipt) {

      //try to buy an article with a bad articleID
      return chainListInstance.buyArticle(2, articleNum + 1, {from: seller, value:web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {

      //check that the there's an article at ID 1, and validate it's info
      return chainListInstance.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1].toNumber(), storeId, "store id must be " + storeId);
      assert.equal(data[2], seller, "seller must be " + seller);
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
      assert.equal(data[6].toNumber(), articleNum, "article num must be " + articleNum);
    });
  });

  /**
   * @dev The below test case ensures that a store owner cannot buy their own article.
   * Allowing store owners to buy their own products could lead to potential malicious spamming.
   * For this reason, we want to check that the require statement in the payable function works as
   * intended.
   */
  it("should throw an exception if you try to buy your own article", function() {
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;

      //try to buy the article as the seller
      return chainListInstance.buyArticle(1, articleNum, {from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1);
    }).then(function(data) {
      //check that the existing article information is unmodified
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1].toNumber(), storeId, "store id must be " + storeId);
      assert.equal(data[2], seller, "seller must be " + seller);
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
      assert.equal(data[6].toNumber(), articleNum, "article num must be " + articleNum);
    });
  });

  /**
   * @dev The below test case ensures that you can only buy the article with the correct
   * listed price. We need to ensure that the asked for price is payed to the seller. If
   * this is not tested and works properly, it would defeat the purpose of setting prices.
   * We need to make sure the application pays the sellers what they asked for accurately.
   */
  it("should throw an exception if you try to buy an article for a value different from its price", function() {
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;

      //try to buy an article with the wrong price
      return chainListInstance.buyArticle(1, articleNum, {from: buyer, value: web3.toWei(articlePrice + 1, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1);
    }).then(function(data) {
      //check that the existing article information is unmodified
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1].toNumber(), storeId, "store id must be " + storeId);
      assert.equal(data[2], seller, "seller must be " + seller);
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
      assert.equal(data[6].toNumber(), articleNum, "article num must be " + articleNum);
    });
  });
});
