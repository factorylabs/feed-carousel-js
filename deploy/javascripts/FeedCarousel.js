var FeedCarousel = function (carouselId, seedObj) {

  //Private  
  var _self = this,
      _carouselObj,
      _carouselId = carouselId,
      _carouselWrapperElm = jQuery(_carouselId)[0],
      _seedJSON = seedObj,
      _ajaxURL = false,
      _init;

  //Public
  this.animationSpeed = 200;
  this.scrollSpeed = 3;

  this.getCarouselId = function () {
    return _carouselId;
  };

  this.getCarouselElm = function () {
    return _carouselWrapperElm;
  };

  this.getCarouselObj = function () {
    return _carouselObj;
  };

  this.getSeedJSON = function () {
    return _seedJSON;
  };

  this.setAjaxURL = function (url) {
    _ajaxURL = url;
  };

  this.getAjaxURL = function () {
    return _ajaxURL;
  };

  //Initialize
  _init = (function () {

    jQuery(_carouselId).jcarousel({
        auto: _self.scrollSpeed,
 
        //Init size
        size: 0,
 
        animation: 'slow',
 
        itemLastInCallback: function (carousel, currListElm, index, state) {
          if (!_self.getAjaxURL()) {

            return false;

          } else {

            if (index + carousel.options.scroll >= carousel.options.size) {
              // TODO
              // console.log(carousel.get(carousel.options.size)[0]);
              // Get last carousel object, and get data unix, append to url
              _self.getJSON({
                'callback': function (filteredJSON) {
                              _self.populateCarousel({
                                'additive': true,
                                'objList': filteredJSON 
                              });
                            },
                'additive': true
              });
            }

          }
        },
 
        initCallback: function (carousel, state) { 
          if (state === 'init') {
            _carouselObj =  carousel;
            _self.populateCarousel({'objList': seedObj});
          }
        }

    });

  })();

};

FeedCarousel.prototype = {

  populateCarousel: function (params) {
    var carouselObj = this.getCarouselObj(),
        count = 0;

    for (count; count < params.objList.items.length; count+=1) {
      this.addItem({
        'objListIndex': count,  
        'objList': params.objList.items, 
        'carouselIndex': (params.additive ? carouselObj.options.size + count : count + 1)
      });
    }
 
    //Update carousel size
    carouselObj.options.size +=  count;
  },
 
  addItem: function (params) {
    var currentItemObject = params.objList[params.objListIndex],
        currentListItem = this.getCarouselObj().add(params.carouselIndex, this.getItemHTML(currentItemObject));
  },
 
  getItemHTML: function (item) {
    var img = item.image, 
        html = '<div data-ajax-offset="' + item.timestamp + '">';
    
    html += (img) ? '<a href="' + item.url + '" title="' + item.title + '" class="item-image-link"><img src="' + item.image + '" width="50" height="50" alt="' + item.title + '" /></a>' : '';   
    html += '<div><p>' + item.content + '<a href="' + item.url + '" title="Read More">More</a></p></div>';
    html += '</div>';
 
    return html;
  },
 
  getStagedItems: function () {
    var carouselObj = this.getCarouselObj(),
        onStage = carouselObj.options.scroll,
        firstStaged = carouselObj.first,
        lastStaged = firstStaged + onStage,
        count = firstStaged,
        stagedItems = [];
 
    for (count; count < lastStaged; count+=1) {
      stagedItems.push(carouselObj.get(count)[0]);
    }

    return stagedItems;
  },
 
  transitionNewItems: function (params) {
    var count = 0,
        self = this,
        stagedItems = this.getStagedItems();

    for (count; count < stagedItems.length; count+=1) {
      jQuery('div:first', stagedItems[count])
        .css(params.css)
        .animate(
            params.animation, 
            self.animationSpeed * (count + 1), 
            (function (itemIndex) { 
              if (params.callback) { 
                return function () { params.callback(itemIndex); };
              }
            })(count)
        );
    }
  },
 
  reloadCarousel: function (filteredJSON) {
    var carouselObj = this.getCarouselObj();

    carouselObj.reset();
 
    carouselObj.options.size = 0; 
 
    this.populateCarousel({
      'filter': true,
      'objList': filteredJSON 
    });
 
    this.transitionNewItems({
      'css': {'position': 'relative', 'top': -jQuery(carouselObj.get(1)).height() - 10, 'opacity': 0},
      'animation': {'top': 0, 'opacity': 1}
    });
 
  },
 
  lockCarousel: function (b) { 
    //TODO
  },

  getJSON: function (params) {
    var carouselObj = this.getCarouselObj(),
        filteredJSON, 
        self = this;
 
    //Started again in success only when additive, otherwise  when content reloaded
    //TODO: Update URL when additive with timestamp
    carouselObj.pauseAuto(); 
 
    this.lockCarousel(true);

    jQuery.ajax(this.getAjaxURL(), {
 
      'cache': false,
 
      'dataType': 'json',
 
      'error': function (jqXHR, textStatus, errorThrown) {
 
      },
 
      'success': function (data, textStatus, jqXHR) {
        if (!data || typeof data.items === undefined) {

          return false;

        } else if (data && data.items && data.items.length > 0) {

          self.lockCarousel(false);

          params.callback(data);

          if (params.additive) {
            carouselObj.startAuto();
          }
        }
      },
 
      'timeout': 5000
 
    });
 
  }

};
