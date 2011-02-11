var FeedCarousel = function (carouselId, seedObj) {

  //Private  
  var _self = this,
      _carouselObj,
      _carouselId = carouselId,
      _carouselWrapperElm = jQuery(_carouselId)[0],
      _seedJSON = seedObj,
      _init;

  //Public
  this.animationSpeed = 200;
  this.ajaxURL = false;
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

  //Initialize
  _init = (function () {


    jQuery(_carouselId).jcarousel({
        auto: _self.scrollSpeed,
 
        //Init size
        size: 0,
 
        animation: 'slow',
 
        itemLastInCallback: function (carousel, currListElm, index, state) {
          if (!_self.ajaxURL) {

            return false;

          } else {

            if (index + carousel.options.scroll >= carousel.options.size ) {
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
            _self.populateCarousel({ 'objList': seedObj});
          }
        }
    });

  })();

};

FeedCarousel.prototype = {

  populateCarousel: function (params) {
    var carouselObj = this.getCarouselObj();

    for (var i = 0; i < params.objList.items.length; i+=1) {
      this.addItem({
          'objListIndex': i,  
          'objList': params.objList.items, 
          'carouselIndex':( params.additive ? carouselObj.options.size + i : i + 1 )
      });
    }
 
    //Update carousel size
    carouselObj.options.size +=  i;
  },
 
  addItem: function (params) {
    var currentItemObject = params.objList[params.objListIndex],
        currentListItem = this.getCarouselObj().add( params.carouselIndex, this.getItemHTML( currentItemObject ));
  },
 
  getItemHTML: function (item) {
    var img = item.image, 
        html = '<div>';
    
    html += (img) ?'<a href="' + item.url + '" title="' + item.title + '" class="item-image-link"><img src="' + item.image + '" width="50" height="50" alt="' + item.title + '" /></a>' : '';   
    html += '<div><p>' + item.content + '<a href="' + item.url + '" title="Read More">More</a></p></div>';
    html += '</div>';
 
    return html;
  },
 
  getStagedItems: function () {
    var carouselObj= this.getCarouselObj(),
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
                return function () { params.callback(itemIndex); } 
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
  },

  getJSON: function (params) {
    var carouselObj = this.getCarouselObj(),
        filteredJSON, 
        self = this;
 
    //Started again in success only when additive, otherwise  when content reloaded
    //TODO: Update URL when additive with timestamp
    carouselObj.pauseAuto(); 
 
    this.lockCarousel(true);

    jQuery.ajax(this.ajaxURL, {
 
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


 
var CarouselFilters = function (feedCarouselObj, filterClasses, filterContainerId) {
  var _self = this,
      _currentFilter,
      _filters,
      _filtersWrapper,
      _feedCarouselObj = feedCarouselObj,
      _init;

  this.getCurrentFilter = function () {
    return _currentFilter;
  };

  this.getAllFilters = function () {
    return _filters;
  };

  this.getFiltersWrapper = function () {
    return _filtersWrapper;
  };

  this.getFeedCarouselObj = function () {
    return _feedCarouselObj;
  };

  this.getCurrentFilter = function () {
    return _currentFilter;
  };

  this.setCurrentFilter = function (filterElm) {
    _currentFilter = filterElm; 
  };

  _init = (function () {
      _filtersWrapper = jQuery(filterContainerId), 
      _filters = jQuery(filterClasses, _filtersWrapper);
      
      _self.setCurrentFilter(jQuery('.current', _filtersWrapper)[0]);

      //Cosmetic initializaiton of select all filter on parent li
      //jQuery(_currentFilter).parent().width(10);
 
      _self.setupFilters();

      jQuery(_filters).click(function ()  {

          if (this === _self.getCurrentFilter()) {
            return false; 
          } else {
            _self.filterAction(this);
            return false;
          }
      
      });

  })();
};

CarouselFilters.prototype = {  

  filterAction: function (filterElm) {
    var self = this,
        feedCarouselObj = this.getFeedCarouselObj();

    //TODO: REMOVE WHEN LIVE URLS
    //feedCarouselObj.ajaxURL = jQuery(filterElm).attr('href');
  
    feedCarouselObj.getJSON({
      'callback': function (filteredJSON) {

        feedCarouselObj.transitionNewItems({
          'css': {'position': 'relative'},
          'animation': {'top': 200},
          'callback': function (itemIndex) {
              if (itemIndex === 1) {
                feedCarouselObj.reloadCarousel(filteredJSON);
              }
          }            

        });

        self.collapseNav(filterElm);

      }
    });
  },

  collapseNav: function (filterElm) {
      var showAllFilter = this.getFiltersWrapper().find('a:first'),
          allFilters = this.getAllFilters(),
          allTypeFiltersButSelf = this.getAllFilters().not(filterElm).not(showAllFilter),
          showAllWidth = showAllFilter[0] === filterElm ? 10 : 128,
          allButShowAllWidth = showAllFilter[0] === filterElm ? 128 : 0;

      allFilters.removeClass('current');
      jQuery(filterElm).addClass('current');
      allTypeFiltersButSelf.parent().animate({'width': allButShowAllWidth});
      showAllFilter.parent().animate({'width': showAllWidth});
 
      this.setCurrentFilter(filterElm); 
  },

  setupFilters: function () {
    var initialJSON = this.getFeedCarouselObj().getSeedJSON(),
        filterCount = 0,
        filterClassName,
        allFilters = this.getAllFilters();

        for(filterCount; filterCount < allFilters.length; filterCount+=1) {
          filterClassName = allFilters[filterCount].className.match(/\w+Filter/)[0].split('Filter')[0];
          this.setFilterHTML(initialJSON.sources[filterClassName], allFilters[filterCount]);
        }

  },

  setFilterHTML: function (filterDataObj, filterElm) {
    jQuery(filterElm).attr({'href': filterDataObj.get_more_items_url}).html(filterDataObj.title + ' <span>' + filterDataObj.total_items + '</span>');
  }
};
 

$(document).ready(function (){
  var feed_carousel = new FeedCarousel('#feedCarousel', social_data);
  feed_carousel.ajaxURL = 'javascripts/json-ajax';

  var carousel_filters = new CarouselFilters(feed_carousel, '.showAllFilter, .twitterFilter, .youtubeFilter, .flickrFilter, .blogsFilter', '#navFilter');
  
});
