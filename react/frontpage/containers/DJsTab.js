// DJsTab.js
// container for frontpage list of djs

import { connect } from 'react-redux';

import {
  updateDJs,
  startFetching,
  stopFetching,
  fetchUpdatedDJs,
} from '../actions/djs';
import DJList from '../components/DJList.js';

const mapStateToProps = state => ({
  djs: state.djs.djs,
  fetching: state.djs.fetching,
});

const mapDispatchToProps = dispatch => ({
  updateDJs: () => {
    fetchUpdatedDJs(dispatch);
  },
});

const DJsTab = connect(mapStateToProps, mapDispatchToProps)(DJList);

export default DJsTab;
