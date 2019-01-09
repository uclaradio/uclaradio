// BlogPage.js
// Blog page

import React from 'react';
import { Link } from 'react-router';
import Loader from './Loader';
import Waterfall from './misc/ResponsiveWaterfall';
import isMobile from './misc/isMobile';
import FeaturedPost from './BlogFeaturedPost';
import NavBar from './BlogNavBar';

import Slider from 'react-slick';
import RectImage from '../../common/RectImage';
import './PromoBanner.scss';

/**
Page content for all blog posts. 
Displays shortened descriptions for each post
* */

const BlogPostsURL = '/getBlogPosts';
const keystoneURL = 'http://localhost:3010';

let waterfall;
import './WaterFallContent.scss';

const BlogPage = React.createClass({
  getInitialState: function() {
    return { posts: [], fetching: true, postNo: 0 };
  },
  componentDidMount() {
    $.get(BlogPostsURL, result => {
      this.setState(
        {
          fetching: false,
          posts: result.blog_posts,
        },
        function() {
          waterfall = new Waterfall({ minBoxWidth: 250 });
          this.appendPosts(result.blog_posts);
          window.addEventListener('scroll', this.handleScroll);
        }
      );
    });
  },
  urlFromPost(post) {
    return `/blog/${post.id}`;
  },
  appendPosts(newPosts) {
    newPosts.map(el => {
      const boxHandle = this.nodeFromPost(el);

      if (boxHandle) {
        waterfall.addBox(boxHandle);
      }
    });
  },

  nodeFromPost(post) {
    const link = this.urlFromPost(post);
    const picture = post.full_picture;
    const summary = post.summary || post.message || '';
    const platform = post.platform || 'FB';
    return this.newNode(picture, summary, link, platform);
  },

  // create new DOM element representing post with provided content
  newNode(full_picture, summary, created_time, link, platform) {
    if (!full_picture && (!summary || summary.includes('http'))) {
      return null;
    }
    const box = document.createElement('div');
    box.className = 'wf-box';
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    const box_content = document.createElement('div');
    box_content.className = 'wf-box-content';
    if (full_picture) {
      const image = document.createElement('img');
      image.src = full_picture;
      box_content.appendChild(image);

      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      box_content.appendChild(overlay);
    }
    const box_content_text = document.createElement('div');
    switch (platform) {
      case 'TUMBLR':
        box_content_text.className = 'wf-box-content-blog';
        break;
    }
    box_content_text.appendChild(document.createTextNode(summary));
    summary = String(summary);
    if (!summary.includes('http') && !summary.includes('undefined')) {
      box_content.appendChild(box_content_text);
    }
    a.appendChild(box_content);
    box.appendChild(a);
    return box;
  },

  getImage(banner) {
    return <div>{banner.title}</div>;
  },

  renderPosts() {
    return this.state.posts.map(post => {
      // Get the html for content

      switch (post.platform) {
        case 'KEYSTONE':
          const img = post.image ? post.image.filename : '';
          return (
            <div key={post.id}>
              <Link to={this.urlFromPost(post)}>
                <h1>{post.title}</h1>
              </Link>
              <img
                alt="post image"
                style={{ width: '300px', height: '300px' }}
                src={keystoneURL + '/' + img}
              />
            </div>
          );
        case 'TUMBLR':
          return (
            <div className="tumblrpost" key={post.id}>
              <Link to={this.urlFromPost(post)}>
                <div>{post.title}</div>
              </Link>
            </div>
          );
      }
    });
  },

  render() {
    const settings = {
      autoplay: true,
      infinite: true,
      fade: true,
      autoplaySpeed: 500000000,
      draggable: false,
    };

    // <Link> component is unable to link to external links
    // Currently doing an inline conditional via a ternary
    // The self variable is be declared as 'this' is function scoped
    // An alternative solution would be to use ES6 arrow functions

    const self = this;
    const posts = this.state.posts.map(post => (
      <div>
        {post.post_url.indexOf('http') == -1 ? (
          <Link to={post.post_url}>{self.getImage(post)}</Link>
        ) : (
          <a href={post.post_url}>{self.getImage(post)}</a>
        )}
      </div>
    ));

    // if (this.state.posts) {
    //   console.log("exists")
    // }
    // else {
    //   console.log("doesnt exist")
    // }

    return (
      <div>
        {
          <div className="promoBanner">
            {posts.length > 0 && <Slider {...settings}>{posts}</Slider>}
          </div>
        }

        <FeaturedPost posts={this.state.posts} />

        <div>
          {' '}
          <NavBar />{' '}
        </div>
        <div className="WaterFallContent">
          {this.state.fetching && <Loader />}
          <div className="wf-container" />
          {isMobile.any() && (
            <span>
              <br />
              <center>
                <button>MORE</button>
              </center>
            </span>
          )}
        </div>
      </div>
    );
  },
});

export default BlogPage;