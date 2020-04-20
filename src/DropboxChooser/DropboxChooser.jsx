import React from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import DropboxChooser from 'react-dropbox-chooser';
import './DroboxChooser.css';
import auth0Client from '../Auth';

class Dropbox extends React.Component {
  constructor(props) {
    super(props);
	
	this.getFiles = this.getFiles.bind(this);
	this.saveFolders = this.saveFolders.bind(this);
	this.onCancel = this.onCancel.bind(this);
	this.getFolderSet = this.getFolderSet.bind(this);
	this.setSaveToFolder = this.setSaveToFolder.bind(this);
	this.setNoFolder = this.setNoFolder.bind(this);

    this.state = 
	{      
	  APP_KEY:'h9fot2c8bxz7gcg',
	  database: null,
	  fromFolder:null,
	  saveTo: null,
	  noFolder: null,
	  folderSet:null
    };
  }  
	async componentDidMount() {
		const database = (await axios.get('http://localhost:8081/')).data;
		this.setState({database});
		if(this.state.database!=null && this.state.database.length >0)
		{
			console.log(this.state.database);
			this.props.history.replace('/Carousel');
		}
	}
  
  setSaveToFolder(e)
  {
	let val = JSON.parse(e.target.value)
	let name = val.path_display;
	this.setState({saveTo:name});				
  }
  
  setNoFolder(e)
  {
	let val = JSON.parse(e.target.value)
	let name = val.path_display;		
	this.setState({noFolder:name});
  }
  
  saveFolders(files)
  {
	console.log('saveFolders');		
	
	fetch('http://localhost:8081/saveFolders?saveTo='+this.state.saveTo+'&noFolder='+this.state.noFolder+'&id='+auth0Client.getProfile().aud + '&getFrom=' + files[0].id, {method: "POST"})
	.then( res => { return res.json(); })
	.then( data => {
		this.props.history.push('/Carousel');		
	})		
  }
  
  getFolderSet()
  {
	  console.log("getFolderSet");
	  fetch('http://localhost:8081/getFolders?getFrom=', {method: "POST"})
		.then( res => { return res.json(); })
		.then( data => 
		{			
			if(data.name && data.name === 'Error'){
				console.log(data.message);
			}
			else if(data.length <1)
			{
				console.log("no files found");
			}
			else
			{
				let folders = data.entries.filter(obj => {return obj['.tag']==='folder'});
				this.setState({folderSet:folders});			
			}
		}).catch(function(e) 
		{
			console.log(e);
		});
  }
  
  getFiles(files) 
  {
	  console.log(files);
  }
  
  onCancel()
  {
	  console.log("canceled");
  }

  render() {
	if(this.state.folderSet === null)
		this.getFolderSet();	
    return (
		<div>
			<div id="header" className='grid-container'>
				<div id="" className='grid-item'> Choose A Folder To Keep Files</div>	
				<div id="" className='grid-item grid-item-empty-cells'></div>	
				<div id="" className='grid-item'> Choose a Folder To Put Rejected Files In</div>	
			</div>
			<div id="foldersBody" className='grid-container'>
				<ul >			
					<div>
						{	this.state.folderSet != null	
							&& <div>
								{this.state.folderSet.map((item,key)=>
								<li key={item.id}>
									<button className="grid-item btn btn-info" name={item.id} id={item.id} value={JSON.stringify(item)} onClick={this.setSaveToFolder}>{item.name}
									</button>
								</li>)}
							</div>} 		
					</div>
				</ul>
				<ul></ul>
				<ul>
					<div>
						{this.state.folderSet != null	
						&& <div>
							{this.state.folderSet.map((item,key)=>
							<li key={item.id}>
								<button className="grid-item btn btn-info" name={item.id} id={item.id} value={JSON.stringify(item)} onClick={this.setNoFolder}>{item.name}</button>								
							</li>)}
						</div>} 		
					</div>
				</ul>
			</div>
			{	this.state.saveTo != null
				&& this.state.noFolder != null	
				&& <div id='modal' className='modal'>
						<div className='modal-content'>
							<span>Select one file from the folder that you want to get images from</span>
							<br/>
							<DropboxChooser 
								id="chooser"
								appKey={this.state.APP_KEY}
								success={files => this.saveFolders(files)}
								cancel={() => this.onCancel()}
								multiselect={false} 
								folderselect={true}
								extensions={['images']}>
								<button size="lg" className='btn btn-info'><img src={'https://www.dropbox.com/s/g2kjbv7svbfke65/drobboxlogo.png?dl=0'} alt="Find A Folder In Dropbpx"/>Dropbox Chooser</button>				
							</DropboxChooser>
						</div>
					</div>
			}
		</div>
    )
  }
}

export default withRouter(Dropbox);