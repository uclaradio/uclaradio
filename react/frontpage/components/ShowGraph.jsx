// ShowsGraph.jsx

var React = require('react');

import Dates from '../../common/Dates';

// styling
require('./shows.css');

const week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/*
Full graph with schedule of shows

@prop currentShowID: id of current show
@prop spotlightShowID: id of spotlight show
@prop schedule: show schedule data object:
	{
		"sunday": {9: {show}, ...},
		...
		"saturday": {11: {show}, ...},
	}
@prop onShowClick(show): callback for when a show is made active
*/
const ShowsGraph = React.createClass({
	render: function() {
		var dayTitles = week.map((day) => {
			return (
				<p style={headsStyle}>
					{Dates.abbreviatedDay(day)}
				</p> 
			);
		});

		var timeStyle = {
			fontSize: '11px',
			marginRight: '3px',
			display: 'inline-block',
			position: 'relative',
			width: '8%',
			top: 7.5
		};

		var showBlocks = "";
		for (var hour = 0; hour < 24; hour++) {
			var hourString = Dates.availableTimes[hour];
			showBlocks += (
				<div style={{ width: '100%', margin: '0 auto' }}>
					<p style={timeStyle}>{hourString}</p> 
					{ week.map((day) => {
						var show = this.props.schedule[day][hour];
						showBlocks += (
							<ShowBlock isValidShow={(show !== null)}
								isCurrentShow={show && show.id === this.props.currentShowID}
								isActiveShow={show && show.id === this.state.activeShowID}
								isSpotlightShow={show && show.id === this.props.spotlightShowID}
								handleClick={()=>{show && this.props.onShowClick(show)}} />
						);
					})}
				</div>
			);
		}

		return (
			<div className="showsGraph">
				{dayTitles}
				{showBlocks}
			</div>
		);
	}
});

/*
Individual show block with rollover action

@prop handleClick: callback for mouse click action
@prop isValidShow: styling bool -> overwrites isCurrentShow and isSpotlightShow if false
@prop isCurrentShow: styling bool: this show is currently playing
@prop isActiveShow: styling bool: user clicked on this show
@prop isSpotlightShow: styling bool: show is a spotlight feature on website
*/
var ShowBlock = React.createClass({
	handleMouseOver: function() {
		this.setState({active: true});
	},
	handleMouseOut: function() {
		this.setState({active: false});
	},
	handleClick: function() {
		this.props.handleClick()
	},
	render: function() {
		if (!this.props.isValidShow) {
			var boringBlockStyle = {
				backgroundColor: 'white'
			}
			return (
				<div className='showBlock' style={boringBlockStyle} />
			);
		} else {
			var blockColor = (this.props.isCurrentShow && '#3c84cc')
				|| (this.props.isSpotlightShow && 'purple')
				|| 'yellow';

			var blockStyle = {
				backgroundColor: blockColor,
			};
			return (
				<div className="showBlock" style={blockStyle}
				onMouseOver={this.handleMouseOver}
				onMouseOut={this.handleMouseOut}
				onClick={this.handleClick}
				/>
			);
		}
	}
});

module.exports = ShowsGraph;
