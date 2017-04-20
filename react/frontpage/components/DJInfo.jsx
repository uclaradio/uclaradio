// DJInfo.jsx
import React from 'react';

// Common Elements
import RectImage from '../../common/RectImage.jsx';

import { Link } from 'react-router';

var defaultDJPic = "/img/bear_transparent.png";

/*
DJInfo: UI element showing information for a dj
@prop picture: url for dj profile picture
@prop name: dj name
*/
var DJInfo = React.createClass({
    getDJImage: function(picURL) {
        return picURL || defaultDJPic;
    },
    getDJLink: function(djName) {
        return "/djs/" + djName; 
    },
    render: function() {
        var className = this.props.picture == null ? "djTile empty" : "djTile full";
      return (
        <div className={className}>
                <Link to={this.getDJLink(this.props.name)}>    
              <RectImage maxWidth="200px" src={this.getDJImage(this.props.picture)} circle />
                    <div className="djTileOverlay">
                        <p className="djName">
                            {this.props.name}
                        </p>
                    </div>
                </Link>
        </div>
      );
    } 
});

module.exports = DJInfo;