// index.js
// Front page

const express = require('express');
const router = express.Router();
const async = require('async');
const shows = require('../database/shows');
const blogposts = require('../database/blogposts');
const passwords = require('../../passwords');
const requestify = require('requestify');

const numberOfFBPosts = 7;
const numberOfTUMBLRPosts = 24;
const keystoneIDLength = 24;
const tumblrIDLength = 12;
const KEYSTONE = 'http://uclaradio-blog.herokuapp.com/api/posts';
const FB = `https://graph.facebook.com/uclaradio?fields=posts.limit(${numberOfFBPosts}){full_picture,message,created_time,link}&access_token=${
  passwords.FB_API_KEY
}`;
const TUMBLR = `https://api.tumblr.com/v2/blog/uclaradio.tumblr.com/posts/text?api_key=${
  passwords.TUMBLR_API_KEY
}&limit=${numberOfTUMBLRPosts}`;
const socialMediaURLs = [FB, TUMBLR];
const blogURLs = [TUMBLR, KEYSTONE];

router.get('/blurbinfo', (req, res, next) => {
  const info = getTimeAndDay();

  shows.getShowByTimeslotAndDay(info.time, info.day, (err, blurb) => {
    if (blurb) blurb.djName = blurb.djName.join(',');

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(blurb));
  });
});

router.get('/getLatestBlogPost', function(req, res) {
  requestify
    .get(KEYSTONE)
    .then(response => {
      const data = response.getBody();
      data.posts = data.posts.filter(post => {
        return post.state == 'published';
      });

      data.posts.forEach(post => {
        if (post.publishedAt) {
          post.date = new Date(post.publishedAt);
        } else {
          post.date = new Date(post.createdAt);
        }
      });

      data.posts = data.posts.sort((a, b) => {
        return b.date - a.date;
      });

      const result = {
        post: data.posts[0],
      };
      res.send(result);
    })
    .fail(response => {
      res.send(null);
    });
});

router.get('/getBlogPosts/:blogPostID', function(req, res) {
  // Length to differentiate blog IDs
  const queryID = req.params.blogPostID;
  var query;
  var platform;
  if (queryID.length == keystoneIDLength) {
    query = `${KEYSTONE}/${queryID}`;
    platform = 'KEYSTONE';
  } else if (queryID.length == tumblrIDLength) {
    platform = 'TUMBLR';
  } else {
    res.send(null);
    return;
  }
  switch (platform) {
    case 'KEYSTONE':
      requestify
        .get(query)
        .then(response => {
          const data = response.getBody();
          data.platform = platform;
          data.date = new Date(data.createdAt);
          data.title = data.name;
          res.send(data);
        })
        .fail(response => {
          res.send(null);
        });
      break;
    case 'TUMBLR':
      blogposts.getPostByID(queryID, (err, o) => {
        if (o) {
          res.send(o);
        } else {
          res.status(400).send(err);
        }
      });
      break;
  }
});

router.get('/getBlogPosts', (req, res) => {
  async.map(
    blogURLs,
    (url, callback) => {
      switch (url) {
        case KEYSTONE:
          requestify
            .get(KEYSTONE)
            .then(response => {
              const data = response.getBody();
              data.posts = data.posts.filter(post => {
                if (post.publishedAt)
                  // if the post has a publishedAt field, only allow it through the filter if it is
                  //  before the current date and time (on load)
                  return (
                    post.state == 'published' &&
                    new Date(post.publishedAt) - new Date() < 0
                  );
                else return post.state == 'published';
              });
              data.posts.forEach(post => {
                post.id = post._id;
                post.platform = 'KEYSTONE';
                if (post.publishedAt) {
                  post.date = new Date(post.publishedAt);
                } else {
                  post.date = new Date(post.createdAt);
                }
                post.title = post.name;
              });
              callback(null, data.posts);
            })
            .fail(response => {
              callback(null, []);
            });
          break;
        case TUMBLR:
          blogposts.getAllPosts((err, o) => {
            if (o) {
              callback(null, o);
            } else {
              callback(err, []);
            }
          });
          break;
      }
    },
    (err, allBlogPosts) => {
      allBlogPosts = [].concat
        .apply([], allBlogPosts)
        .sort((postA, postB) => new Date(postB.date) - new Date(postA.date));
      const result = {
        blog_posts: allBlogPosts,
      };
      res.send(result);
    }
  );
});

router.get('/getSocialMedia', (req, res) => {
  let FB_pagination_until; // get the index of the last facebook post basically
  async.map(
    socialMediaURLs,
    (url, callback) => {
      requestify
        .get(url, {
          cache: {
            cache: true,
            // cache for 30*60*60*1000 milliseconds
            expires: 108000000,
          },
        })
        .then(response => {
          const data = response.getBody();
          switch (url) {
            case FB:
              FB_pagination_until = getFBPaginationTools(
                data.posts.paging.next
              );
              data.posts.data.forEach(post => {
                post.platform = 'FB';
                post.created_time = new Date(post.created_time);
              });
              callback(null, data.posts.data);
              break;
            case TUMBLR:
              data.response.posts.forEach(post => {
                post.platform = 'TUMBLR';
                post.created_time = new Date(post.date);
              });
              callback(null, data.response.posts);
              break;
          }
        })
        .fail(response => {
          callback(null, []);
        });
    },
    (err, allSocialMediaPosts) => {
      allSocialMediaPosts = [].concat
        .apply([], allSocialMediaPosts)
        .sort((postA, postB) => postA.created_time < postB.created_time);
      const result = {
        social_media: allSocialMediaPosts,
        fb_pagination_until: FB_pagination_until,
        offset: 0,
      };
      res.send(result);
    }
  );
});

router.post('/getMoreFBPosts', (req, res) => {
  const url = getNextFBPosts(req.body.until);
  requestify
    .get(url, {
      cache: {
        cache: true,
        // cache for 30*60*60*1000 milliseconds
        expires: 108000000,
      },
    })
    .then(response => {
      response = response.getBody();
      res.send({
        social_media: response.data,
        fb_pagination_until: getFBPaginationTools(response.paging.next),
      });
    });
});

router.get('/pledgedrive', (req, res, next) => {
  res.render('pledgedrive');
});

// you should be familiar with facebook's 'next' URLS before modifying this function
function getFBPaginationTools(url) {
  paging_token = 0;
  until = url.split('until=')[1].split('&')[0] - 1;
  return until;
}

function getNextFBPosts(FB_pagination_until) {
  return `https://graph.facebook.com/v2.7/214439101900173/posts?fields=full_picture,message,created_time,link&limit=10&access_token=${
    passwords.FB_API_KEY
  }&until=${FB_pagination_until}`;
}

function getTimeAndDay() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date();

  const day = days[date.getDay()];
  let time = date.getHours();

  // Change the time into the format our db is expecting
  // AKA 12pm, 10am, 1pm: hour followed by am or pm
  if (time === 0) {
    time = '12am';
  } else if (time < 12) {
    time += 'am';
  } else if (time == 12) {
    time = '12pm';
  } else {
    time -= 12;
    time += 'pm';
  }

  return {
    day,
    time,
  };
}

module.exports = router;
