App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  //initialize the smart contract
  initWeb3: function() {
    // initialize web3
    if(typeof web3 !== 'undefined') {
      //reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      //create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    App.displayAccountInfo();

    var articleTemplate = $("#toggleButtons");
    articleTemplate.find('.btn-addSO').hide();
    articleTemplate.find('.btn-addS').hide();

    return App.initContract();
  },

  //display the balance and account currenly in use by the user
  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if(err === null) {
            $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
          }
        })
      }
    });
  },

  //get the ChainList contract and begin initialization
  initContract: function() {
    $.getJSON('ChainList.json', function(chainListArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      // set the provider for our contracts
      App.contracts.ChainList.setProvider(App.web3Provider);
      // listen to events
      App.listenToEvents();
      // retrieve the article from the contract
      return App.reloadArticles();
    });
  },

  //load all stores and articles into the web app
  reloadArticles: function() {
    // avoid reentry
    if(App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance might have changed
    App.displayAccountInfo();

    var chainListInstance;
    var articleTemplate = $("#toggleButtons");

    //check if the account is an admin, and give admin functionality if so
    App.contracts.ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getAdmins();
    }).then(function(admins) {

      for(var i = 0; i < admins.length; i++) {
        if(admins[i] == App.account) {
          articleTemplate.find('.btn-addSO').show();
          break;
        }
      }
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });

    //check if the account is a store owner, and give store owner functinality if so
    App.contracts.ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getStoreOwners();
    }).then(function(storeOwners) {

      for(var i = 0; i < storeOwners.length; i++) {
        if(storeOwners[i] == App.account) {
          articleTemplate.find('.btn-addS').show();
          break;
        }
      }
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });

    //populate the list of stores given information from the contract
    App.contracts.ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getAllStores();
    }).then(function(storeIds) {
      // retrieve the store placeholder and clear it
      $('#storesRow').empty();

      for(var i = 0; i < storeIds.length; i++) {
        var storeId = storeIds[i];

        //get list of store ids
        chainListInstance.stores(storeId.toNumber()).then(function(store){

          App.displayStore(store[0], store[1], store[2], store[3]);
        });
      }
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });

    //populate articles for sale given a storeid
    App.contracts.ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getArticlesForSale();
    }).then(function(articleIds) {
      // retrieve the article placeholder and clear it
      $('#articlesRow').empty();

      var toggleButtons = $("#articleTemplate");
      var toggleButtons2 = $("#toggleButtons");

      App.contracts.ChainList.deployed().then(function(instance) {

        //turn off certain buttons if you are/are not the store owner
        chainListInstance.stores(localStorage.getItem("value")).then(function(store) {
          if(store[1] == App.account) {
            toggleButtons2.find('.btn-add-article').show();
            toggleButtons.find('.btn-edit').show();
            toggleButtons.find('.btn-buy').hide();
          }

          else {
            toggleButtons2.find('.btn-add-article').hide();
            toggleButtons.find('.btn-edit').hide();
            toggleButtons.find('.btn-buy').show();
          }
        });
      });

      for(var i = 0; i < articleIds.length; i++) {
        var articleId = articleIds[i];
        chainListInstance.articles(articleId.toNumber()).then(function(article){

          var _storeId = localStorage.getItem("value");

          if(article[1].toNumber() == _storeId) {
            App.displayArticle(_storeId, articleId, article[0], article[2], article[3], article[4], article[5], article[6]);
          }
        });
      }
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  //display the store information onto the web app given the template in the html file
  displayStore: function(id, storeOwner, name, articleCount) {
    var storesRow = $('#storesRow');
    var storeTemplate = $("#storeTemplate");

    var _store_name = "Store: " + name;
    var _store_owner = "Owner: " + storeOwner;
    var _articles = "Articles Available in Store: " + articleCount;

    storeTemplate.find('.store-panel-id').text(id);
    storeTemplate.find('.store-panel-title').text(_store_name);
    storeTemplate.find('.store-owner-address').text(_store_owner);
    storeTemplate.find('.store-available-articles').text(_articles);

    storeTemplate.find('.btn-add-article').attr('data-id', id);
    storeTemplate.find('.btn-show-articles').attr('data-id', id);

    // add this new store
    storesRow.append(storeTemplate.html());
  },

  //display the article information onto the web app given the template in the html file
  displayArticle: function(storeArticles, articleId, id, seller, name, description, price, number) {
    var articlesRow = $('#articlesRow');

    var etherPrice = web3.fromWei(price, "ether");

    var articleTemplate = $("#articleTemplate");
    articleTemplate.find('.panel-title').text(name);
    articleTemplate.find('.article-description').text(description);
    articleTemplate.find('.article-price').text(etherPrice + " ETH");
    articleTemplate.find('.article-number').text(number);
    articleTemplate.find('.btn-buy').attr('data-id', id);
    articleTemplate.find('.btn-buy').attr('data-value', etherPrice);
    articleTemplate.find('.btn-edit').attr('data-id', id);

    var toggleButtons = $("#articleTemplate");
    var toggleButtons2 = $("#toggleButtons");

    // add this new article
    articlesRow.append(articleTemplate.html());
  },

  //sets the selected store into local storage for later use
  displayArticles: function() {
    localStorage.setItem("value", $("#storage").find('.selected-store').text());
  },

  //add an owner into the list of store owners
  addOwner: function() {
    // retrieve the detail of the article
    var _new_owner = $('#new_owner').val();

    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.addOwner(_new_owner, {
        from: App.account,
        gas: 50000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  //add a store to the list of stores
  addStore: function() {
    // retrieve the detail of the article
    var _store_name = $('#store_name').val();

    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.addStore(_store_name, {
        from: App.account,
        gas: 5000000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  //add an article ot the list of articles
  addArticle: function() {
    // retrieve the detail of the article
    var storeTemplate = $("#storeTemplate");

    var _storeId = localStorage.getItem("value");

    var _article_name = $('#article_name').val();
    var _description = $('#article_description').val();
    var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");
    var _number = $('#article_number').val();

    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.addArticle(_storeId, _article_name, _description, _price, _number, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  //set the article selected to be bought into local storage
  buyArticleNum: function() {
    // retrieve the detail of the article
    var _articleId = $(event.target).data('id');

    $("#storage").find('.selected-article').text(_articleId);
    localStorage.setItem("price", parseFloat($(event.target).data('value')));

    console.log(_articleId);
  },

  //set the article selected into local storage
  setArticleNum: function() {
    // retrieve the detail of the article
    var _articleId = $(event.target).data('id');

    $("#storage").find('.selected-article').text(_articleId);
  },

  //set the store selected into local storage
  setStoreNum: function() {
    // retrieve the detail of the article
    var _storeId = $(event.target).data('id');

    $("#storage").find('.selected-store').text(_storeId);
  },

  //edit the values of the selected article
  editArticle: function() {
    // retrieve the detail of the article
    var articleTemplate = $("#articleTemplate");

    var _articleId = $("#storage").find('.selected-article').text();
    var _article_name = $('#edited_article_name').val();
    var _description = $('#edited_article_description').val();
    var _price = web3.toWei(parseFloat($('#edited_article_price').val() || 0), "ether")
    var _number = $('#edited_article_number').val();

    if((_article_name.trim() == '') || (_price == 0)) {
      // nothing to sell
      return false;
    }

    //call the editArticle function from the smart contract
    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.editArticle(_articleId, _article_name, _description, _price, _number , {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  // listen to events triggered by the contract
  listenToEvents: function() {
    App.contracts.ChainList.deployed().then(function(instance) {
      instance.LogSellArticle({}, {}).watch(function(error, event) { App.reloadArticles(); });

      instance.LogBuyArticle({}, {}).watch(function(error, event) { App.reloadArticles(); });

      instance.LogNewStore({}, {}).watch(function(error, event) { App.reloadArticles(); });
    });
  },

  //buy the selected article
  buyArticle: function() {
    event.preventDefault();

    // retrieve the article
    var _articleId = $("#storage").find('.selected-article').text();
    var _price = localStorage.getItem("price");
    var _number = $('#buy_article_number').val();

    var _balance = $('#accountBalance').text();
    var _actual_price = _number * _price;

    //call the buy article function from the smart contract
    App.contracts.ChainList.deployed().then(function(instance){
      return instance.buyArticle(_articleId, _number, {
        from: App.account,
        value: web3.toWei(_actual_price, "ether"),
        gas: 5000000
      });
    }).catch(function(error) {
      console.error(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
