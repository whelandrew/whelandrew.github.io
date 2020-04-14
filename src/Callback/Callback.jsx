import React from 'react';
import {withRouter} from 'react-router-dom';
import auth0Client from '../Auth';

class Callback extends React.Component {
  async componentDidMount() {
    await auth0Client.handleAuthentication();
    this.props.history.replace('/');
  }

  render() {
    return (
      <p>Loading profile...</p>
    );
  }
}

export default withRouter(Callback);