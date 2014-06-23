module.exports = Photostream;
var _ = require('lodash');

function Photostream(){};
Photostream.prototype.name = "tumblr-photostream";
Photostream.prototype.view = __dirname;

// The create function is called after the component is created
// and has been added to the DOM. It only runs in the browser
Photostream.prototype.create = function(model, dom) {
  var url = 'http://api.tumblr.com/v2/blog/mcclurecreative.tumblr.com/posts/photo?api_key=fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4&limit=8&jsonp=?';
  $.ajax({
    dataType: "jsonp",
    url: url,
    error: function(err) {
      console.log("err: ", err);
    },
    success: function(data) {
      if (data && data.response && data.response.posts) {
        var newPosts = [];
        var posts = data.response.posts;
        _.each(posts, function(p, key, list) {
          // only return photos
          if (p.photos) {
            var obj = {
              title: p.caption,
              url: p.post_url,
              src: p.photos[0].alt_sizes[3].url
            }
            newPosts.push(obj);
          }
        });
        model.set('photos', newPosts);
      }
    }
  });

}
