import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import auth0Client from '../Auth';
import './NavBar.css';
import logo from '../Assets/logo.png';

function NavBar(props) {
	const signOut = () =>
	{
		auth0Client.signOut();
		this.props.history.replace('/');
	};
	
  return (<div>
    <nav id='navbar' className="navbar navbar-dark bg-primary fixed-top">
      <Link id="brand" className="navbar-brand" to="/">
		<img src={logo} alt=""/> Krom's Image Slider
      </Link>
	  {
        !auth0Client.isAuthenticated() &&
        <button className="btn btn-info" onClick={auth0Client.signIn}>Sign In</button>
      }
      {
        auth0Client.isAuthenticated() &&
        <div>
          <label className="mr-2 text-white">
			<img src={auth0Client.getProfile().picture} alt=""/>
			Hi, {auth0Client.getProfile().given_name}!</label>
          <button className="btn btn-dark" onClick={() => {signOut()}}>Sign Out</button>
        </div>
      }
    </nav>
	
	
	{	!auth0Client.isAuthenticated()
		&& <div id="centerSignInButton"><button className="btn btn-info" onClick={auth0Client.signIn}>Sign In to Dropbox Start Sorting!</button></div>
	}
	</div>
  );
}

export default withRouter(NavBar);