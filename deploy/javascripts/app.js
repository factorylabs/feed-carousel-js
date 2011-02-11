jQuery(document).ready(function () {
  var feed_carousel,
      carousel_filters;
    
  feed_carousel = new FeedCarousel('#feedCarousel', social_data);
  feed_carousel.ajaxURL = 'javascripts/json-ajax';
  carousel_filters = new FeedCarouselFilters(feed_carousel, '.showAllFilter, .twitterFilter, .youtubeFilter, .flickrFilter, .blogsFilter', '#navFilter');
  
});
