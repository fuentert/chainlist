pragma solidity ^0.4.18;

import "zeppelin/contracts/ownership/Ownable.sol";

/**
 * @title Chainlist
 * @dev The Chainlist contract allows store owners to publish articles for sale, and general users to purchase
 * articles using ETH. This contract uses the Ownable contract from EthPM to ensure that the kill function is
 * only called by the contract owner.
 */
contract ChainList is Ownable {
  // custom Article type, stored as a struct
  struct Article {
    uint id;
    uint storeId;
    address seller;
    string name;
    string description;
    uint256 price;
    uint number;
  }

  // custom boughtArticles, stored as a struct
  struct boughtArticle {
    uint articleId;
    uint storeId;
    address seller;
    address buyer;
    uint256 price;
    uint number;
  }

  // custom Store type, stored as a struct
  struct Store {
    uint storeId;
    address storeOwner;
    string storeName;
    uint storeArticles;
  }

  //set the first admin with owner of contract - using owner will not work here
  address firstAdmin = msg.sender;

  //list of admins to add store owners; starts with the contract owner
  address[] public admins = [firstAdmin];

  //list of store owners; uses generic account as first owner for easy testing purposes
  //the default account would normally be empty if for actual use for additional security purposes
  address[] public storeOwners = [0x0];

  //mapping of all stores using the storeId as the key
  mapping (uint => Store) public stores;
  uint storeCounter;

  //mapping of all articles using the articleId as the key
  mapping (uint => Article) public articles;
  uint articleCounter;

  //mapping of all bought articles using the boughtArticleId as the key
  mapping (uint => boughtArticle) public boughtArticles;
  uint boughtArticleCounter;

  //event fired to reload page when an article is added or edited
  event LogSellArticle(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
  );

  //event fired to reload page when an article is bought
  event LogBuyArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
  );

  //event fired to reload page when a store is added
  event LogNewStore(
    uint indexed _storeCounter,
    address indexed _storeOwner,
    string _store_name,
    uint _store_articles
  );

  /**
   * @dev Kill the contract, but only if the contract owner calls the function.
   */
  function kill() public onlyOwner {
    selfdestruct(owner);
  }

  /** @dev Adds a new owner to the list of owners.
    * @param _new_owner Address of new owner
    */
  function addOwner(address _new_owner) public {
    storeOwners.push(_new_owner);
  }

  /** @dev Adds a new store to the list of stores.
    * @param _store_name Name of the new store
    */
  function addStore(string _store_name) public {
    storeCounter++; //increment storeId and storeCount

    //store this store
    stores[storeCounter] = Store(
      storeCounter,
      msg.sender,
      _store_name,
      0
    );

    //reload the webpage
    LogNewStore(articleCounter, msg.sender, _store_name, 0);
  }

  /** @dev Adds a new article to the list of articles.
    * @param storeId The ID of the store the article is in
    * @param _name Name of the new article
    * @param _description Description of the article
    * @param _price Price of the article
    * @param _number Number of articles available
    */
  function addArticle(uint storeId, string _name, string _description, uint256 _price, uint _number) public {
    // a new article
    articleCounter++;

    // store this article
    articles[articleCounter] = Article(
      articleCounter,
      storeId,
      msg.sender,
      _name,
      _description,
      _price,
      _number
    );

    //increment store article count
    stores[storeId].storeArticles = stores[storeId].storeArticles + 1;

    //reload the webpage
    LogSellArticle(articleCounter, msg.sender, _name, _price);
  }

  /** @dev Edits an existing article from a list of articles.
    * @param articleId The ID of the article to edit
    * @param _name New name of the new article
    * @param _description New description of the article
    * @param _price New price of the article
    * @param _number New number of articles available
    */
  function editArticle(uint articleId, string _name, string _description, uint256 _price, uint _number) public {
    // store this article
    articles[articleId].name = _name;
    articles[articleId].description = _description;
    articles[articleId].price = _price;
    articles[articleId].number = _number;

    //reload the webpage
    LogSellArticle(articleId, msg.sender, _name, _price);
  }

  /** @dev Fetch the number of articles in the contract.
    * @return articleCounter The number of existing articles in the contract.
    */
  function getNumberOfArticles() public view returns (uint) { return articleCounter; }

  /** @dev Fetch the list of admins in the contract.
    * @return admins The list of admins in the contract.
    */
  function getAdmins() public view returns (address[]) { return admins; }

  /** @dev Fetch the list of store owners in the contract.
    * @return storeOwners The list of store owners in the contract.
    */
  function getStoreOwners() public view returns (address[]) { return storeOwners; }

  /** @dev Fetch and return all article IDs for articles still for sale.
    * @return forSale The list of articles available for sale in the contract.
    */
  function getArticlesForSale() public view returns (uint[]) {
    // prepare output array
    uint[] memory articleIds = new uint[](articleCounter);

    uint numberOfArticlesForSale = 0;
    // iterate over articles
    for(uint i = 1; i <= articleCounter;  i++) {
      // keep the ID if the article is still for sale
      if(articles[i].number > 0) {
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    // copy the articleIds array into a smaller forSale array
    uint[] memory forSale = new uint[](numberOfArticlesForSale);
    for(uint j = 0; j < numberOfArticlesForSale; j++) {
      forSale[j] = articleIds[j];
    }

    //return the articles that are still for sale
    return forSale;
  }

  /** @dev Fetch and return the number of articles in a given store.
    * @param _storeID The ID of the store to use
    * @return storeIds The number of articles that exist in a store.
    */
  function getArticlesInStore(uint _storeID) public view returns (uint) {
    //get list of available articles and prepare counter
    uint[] memory availableArticles = getArticlesForSale();
    uint storeCount = 0;
    //loop through the list of available articles
    for(uint i = 0; i < availableArticles.length; i++) {
      uint articleId = availableArticles[i];
      uint articleStoreId = articles[articleId].storeId;

      //increase the count of articles that are in the store
      if(articleStoreId == _storeID) {
        storeCount++;
      }
    }

    //return the count of articles in the store
    return storeCount;
  }


  /** @dev Fetch and return all store IDs for esisting stores.
    * @return storeIds The list of store IDs that exist in the contract.
    */
  function getAllStores() public view returns (uint[]) {
    // prepare output array
    uint[] memory storeIds = new uint[](storeCounter);

    uint count = 0;
    // iterate over articles
    for(uint i = 1; i <= storeCounter; i++) {
      // keep the ID of the store
      storeIds[count] = stores[i].storeId;
      count++;
    }

    //return all existing store IDs
    return storeIds;
  }

  /** @dev Buy an existing article that is for sale.
    * @param _id The ID of the article to buy
    * @param _number The number of articles to buy
    */
  function buyArticle(uint _id, uint _number) payable public {
    //check whether there is an article for sale
    require(articleCounter > 0);

    //check that the article exists
    require(_id > 0 && _id <= articleCounter);

    //retrieve the article
    Article storage article = articles[_id];

    //check that the article has not been sold out yet
    require(article.number >= 0);

    //check that the user can buy the specific number of articles
    require(article.number >= _number);

    //don't allow the seller to buy his own article
    require(msg.sender != article.seller);

    //calculate the actual price based on number user is buying
    var actualPrice = (_number * article.price);

    //check that the value sent corresponds to the price of the article
    require(msg.value == actualPrice);

    //decrease available articles
    article.number = (article.number - _number);

    //reduce the number of store articles available in the store if an article has been sold out
    if(article.number <= 0) {
      uint storeid = article.storeId;
      stores[storeid].storeArticles = stores[storeid].storeArticles - 1;
    }

    //increase bought article counter
    boughtArticleCounter++;

    // store the bought article
    boughtArticles[boughtArticleCounter] = boughtArticle(
      _id,
      article.storeId,
      article.seller,
      msg.sender,
      article.price,
      _number
    );

    // the buyer can pay the seller
    article.seller.transfer(msg.value);

    //reload the webpage
    LogBuyArticle(_id, article.seller, msg.sender, article.name, actualPrice);
  }
}
