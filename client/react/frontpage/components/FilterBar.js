// FilterBar.js
// filtering bar for BlogPage

import React from 'react';
import { Input, Glyphicon } from 'react-bootstrap';
import './FilterBar.scss';
/**
Displays toggleable filter tags.
Returns an array of selected filters tags.
* */

const FilterBar = React.createClass({
  getInitialState: function() {
    return {
      selectedFilters: [],
      concertCheck: false,
      showDropdown: false,
    };
  },
  containsFilter(filterName) {
    var list = this.state.selectedFilters;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === filterName) {
        return true;
      }
    }
    return false;
  },
  insertFilter(filterName) {
    this.setState(
      {
        selectedFilters: [...this.state.selectedFilters, filterName],
      },
      () => {
        this.props.handleFilterChange(this.state.selectedFilters);
      }
    );
  },
  deleteFilter(filterName) {
    var array = [...this.state.selectedFilters];
    var index = array.indexOf(filterName);
    if (index !== -1) {
      array.splice(index, 1);
      this.setState({ selectedFilters: array }, () => {
        this.props.handleFilterChange(this.state.selectedFilters);
      });
    }
  },
  updateSelectedFilters(filterName) {
    if (this.containsFilter(filterName)) {
      this.deleteFilter(filterName);
    } else {
      this.insertFilter(filterName);
    }
  },
  showDropdown(event) {
    event.preventDefault();

    this.setState({ showDropdown: true }, () => {
      document.addEventListener('click', this.closeDropdown);
    });
  },
  closeDropdown() {
    if (!this.dropdownMenu.contains(event.target)) {
      this.setState({ showDropdown: false }, () => {
        document.removeEventListener('click', this.closeDropdown);
      });
    }
  },
  render() {
    return (
      <div className="dropdown">
        <button className="dropbtn" onClick={this.showDropdown}>
          Topic
        </button>
        {this.state.showDropdown ? (
          <ul
            className="dropdown-content"
            ref={element => {
              this.dropdownMenu = element;
            }}
          >
            <li className="FilterEl" id="shows">
              <Input
                type="checkbox"
                onChange={() => {
                  this.updateSelectedFilters('ConcertReview');
                }}
                label="Show Reviews"
              />
            </li>
            <li className="FilterEl" id="artists">
              <Input
                type="checkbox"
                onChange={() => {
                  this.updateSelectedFilters('ArtistInterview');
                }}
                label="Artist Interviews"
              />
            </li>
            <li className="FilterEl" id="sports">
              <Input
                type="checkbox"
                onChange={() => {
                  this.updateSelectedFilters('Sports');
                }}
                label="Sports"
              />
            </li>
            <li className="FilterEl" id="festivals">
              <Input
                type="checkbox"
                onChange={() => {
                  this.updateSelectedFilters('FestivalReview');
                }}
                label="Festival Reviews"
              />
            </li>
            <li className="FilterEl" id="other">
              <Input
                type="checkbox"
                onChange={() => {
                  this.updateSelectedFilters('Other');
                }}
                label="Other"
              />
            </li>
          </ul>
        ) : null}
      </div>
    );
  },
});

export default FilterBar;
