// djs.js
// action creators for actions related to frontpage djs

export const updateDJs = djs => ({
  type: 'UPDATE_DJS',
  djs,
});

export const startFetching = () => ({
  type: 'STARTED_FETCHING_DJS',
});

export const stopFetching = () => ({
  type: 'STOPPED_FETCHING_DJS',
});

// Fetch updated DJ list from server and update store via dispatch
// const djsURL = '/api/djs'; // uncomment this later
const djsURL = 'https://uclaradio.com/api/djs';

export const fetchUpdatedDJs = dispatch => {
  dispatch(startFetching());
  $.ajax({
    url: djsURL,
    dataType: 'json',
    cache: false,
    success(data) {
      dispatch(stopFetching());
      dispatch(updateDJs(data.djs));
    },
    error(xhr, status, err) {
      dispatch(stopFetching());
      console.error(djsURL, status, err.toString());
    },
  });
};
