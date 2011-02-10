var JCarousel = JCarousel || {};
 
//Protect this
JCarousel.self = null;
JCarousel.currentFilter = null;
JCarousel.animationSpeed = 200;
 
JCarousel.utils = {
 
  populateCarousel: function (params) {
    for (var i = 0; i < params.objList.items.length; i++) {
      this.addItem({
          'objListIndex': i,  
          'objList': params.objList.items, 
          'carouselIndex':( params.additive ? JCarousel.self.options.size + i : i + 1 )
      });
    }
 
    //Update carousel size
    JCarousel.self.options.size +=  i;
  },
 
  addItem: function (params) {
    var currentItemObject = params.objList[params.objListIndex],
        currentListItem = JCarousel.self.add( params.carouselIndex, this.getItemHTML( currentItemObject ));
 
    return currentListItem;
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
    var firstIndex = JCarousel.self.first,
        scrollInt = JCarousel.self.options.scroll,
        stagedItems = [];
 
      for (var i = firstIndex; i < firstIndex + scrollInt; i++) {
        stagedItems.push(JCarousel.self.get(i)[0]);
      }
 
      return stagedItems;
  },
 
  transitionNewItems: function (params) {
    jQuery(this.getStagedItems()).each(function (i){
 
      //Account for 0 based loop, when indexing for jcarousel - which starts at 1
      i+=1;
 
      jQuery('div:first', this)
        .css(params.css)
        .animate(
            params.animation, 
            JCarousel.animationSpeed * i, 
            (function (itemIndex) { 
              if (params.callback) { 
                return function () { params.callback(itemIndex); } 
              }
            })(i)
        );
    });
  },
 
  reloadCarousel: function (filteredJSON) {
    JCarousel.self.reset();
 
    JCarousel.self.options.size = 0; 
 
    JCarousel.utils.populateCarousel({
      'filter': true,
      'objList': filteredJSON 
    });
 
    JCarousel.utils.transitionNewItems({
      'css': {'position': 'relative', 'top': -jQuery(JCarousel.self.get(1)).height() - 10, 'opacity': 0},
      'animation': {'top': 0, 'opacity': 1}
    });
 
  },
 
  lockCarousel: function (b) { 
  },
 
  getJSON: function (params) {
     var filteredJSON, 
         self = this;
 
    //Double click
    if(jQuery(params.filterElm).hasClass('current') && !params.additive) {
      return false;
    }
 
    //Started again when content reloaded
    if (!params.additive) {
      JCarousel.self.pauseAuto(); 
    }
 
    this.lockCarousel(true);
    //TODO set this url as currentFilters href attr, return false 
    //console.log(JCarousel.currentFilter.getAttribute('href'));

    jQuery.ajax('javascripts/json-ajax', {
 
      'cache': false,
 
      'dataType': 'json',
 
      'error': function (jqXHR, textStatus, errorThrown) {
 
      },
 
      'success': function (data, textStatus, jqXHR) {
        self.lockCarousel(false);
        params.callback(data);
 
      },
 
      'timeout': 5000
 
    });
 
  }
 
 
};
 
JCarousel.filters = {
 
  init: function (initialJSON, filterContainerId) {
 
      JCarousel.currentFilter = jQuery('.current', filterContainerId)[0];

      //Cosmetic initializaiton of select all filter on parent li
      jQuery(JCarousel.currentFilter).parent().width(10);
 
      jQuery('.showAllFilter, .twitterFilter, .youtubeFilter, .flickrFilter, .blogsFilter', filterContainerId).click(function ()  {
 
          var self = this;
 
          JCarousel.utils.getJSON({
            'filterElm': this, 
 
            'callback': function (filteredJSON) {
 
              JCarousel.utils.transitionNewItems({
                'css': {'position': 'relative'},
                'animation': {'top': 200},
                'callback': function (itemIndex) {
                    if (itemIndex === 1) {
                      JCarousel.utils.reloadCarousel(filteredJSON);
                    }
                }            
              });
 
              JCarousel.filters.collapseNav(self);
            }
          });

          return false;
      
      });

      this.setupFilters(initialJSON, filterContainerId);
 
  },

  setupFilters: function (initialJSON, filterContainerId) {

    var filterCount,
        filterClassName,
        allFilters = jQuery(filterContainerId).find('a');

        for(filterCount = 0; filterCount < allFilters.length; filterCount+=1) {
          filterClassName = allFilters[filterCount].className.match(/\w+Filter/)[0].split('Filter')[0];
          this.setFilterHTML(initialJSON.sources[filterClassName], allFilters[filterCount]);
        }

  },

  setFilterHTML: function (filterDataObj, filterElm) {
    jQuery(filterElm).attr({'href': filterDataObj.get_more_items_url}).html(filterDataObj.title + ' <span>' + filterDataObj.total_items + '</span>');
  },
 
  collapseNav: function (filterElm) {
      var showAllFilter = jQuery(filterElm).parents('ul').find('a:first'),
          allTypeFiltersButSelf = jQuery(filterElm).parents('ul').find('li:not(:first)').find('a').not(filterElm),
          allFilters = jQuery(filterElm).parents('ul').find('a'),
          showAllWidth = showAllFilter[0] === filterElm ? 10 : 128,
          allButShowAllWidth = showAllFilter[0] === filterElm ? 128 : 0;
 
      allFilters.removeClass('current');
      jQuery(filterElm).addClass('current');
      allTypeFiltersButSelf.parent().animate({'width': allButShowAllWidth});
      showAllFilter.parent().animate({'width': showAllWidth});
 
      JCarousel.currentFilter = filterElm; 
  }
};
 
 
jQuery(document).ready(function() {
    jQuery('#feedCarousel').jcarousel({
        auto: 10,
 
        //Init size
        size: 0,
 
        animation: 'slow',
 
        itemLastInCallback: function (carousel, currListElm, index, state) {

          if (index + carousel.options.scroll >= carousel.options.size ) {
            //Only add new if we have them - switch to check if we need to load items
            JCarousel.utils.getJSON({
              'filterElm': JCarousel.currentFilter, 
              'callback': function (filteredJSON) {
                  JCarousel.utils.populateCarousel({
                    'additive': true,
                    'objList': filteredJSON 
                  });
              }, 
              'additive': true
            });
          }
        },
 
        initCallback: function (carousel, state) { 
          if (state === 'init') {
            JCarousel.self =  carousel;

            JCarousel.utils.populateCarousel({ 'objList': social_data });
 
            JCarousel.filters.init(social_data, '#navFilter'); 
          }
        }
    });
});
