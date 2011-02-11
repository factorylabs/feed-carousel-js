var FeedCarouselFilters = function (feedCarouselObj, filterClasses, filterContainerId) {
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

FeedCarouselFilters.prototype = {  

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
