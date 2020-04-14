import React from "react";
import axios from 'axios';

import "./Carousel.css";
import "./slick.css";
import "./slick-theme.css";

import { HeartFill, XSquareFill } from 'react-bootstrap-icons';
import Slider from "react-slick";

export default class Carousel extends React.Component 
{	
	constructor(props) {
		super(props);				

		this.getImages = this.getImages.bind(this);

		this.state = {
			database:null,
			images:null,			
			sliderProps:
			{
				dots: false,
				infinite: true,
				speed: 500,
				slidesToShow: 1,
				slidesToScroll: 1,
				loading: true
			}
		}
	}	
	
	async componentDidMount()
	{
		console.log('Carousel');
		const database = (await axios.get('http://localhost:8081/')).data;			
		this.setState({database:database[0]});		
		this.getImages();
	}
	
	rebuildSet(data, toFolder) 	
	{
		console.log("rebuildSet");	
		const sendToFolder = toFolder +'/' + data.result.name;
		const fromFolder = this.state.database.getFrom.name + data.result.name;
		
		fetch('http://localhost:8081/moveFile?toFolder=' + sendToFolder + '&fromFolder=' + fromFolder, {method: "POST"})
		.then( res => { return res.json(); })
		.then( data => {								
			let list = this.state.images;			
			for(let i=0;i<list.length;i++)
			{
					if(list[i].result.name === data.name)
					{						
						list.splice(i,1);
					}
			}		
			this.setState({images:list});			
		});
	}
	
	getImages() 
	{
		fetch('http://localhost:8081/getFolders?getFrom=' + this.state.database.getFrom.name, {method: "POST"})
		.then( res => { return res.json(); })
		.then( data => {		
			console.log('batchMetaData');
			data = data.entries;
			const cap = 100;
			if(data.length > cap) data = data.slice(0,cap);
			
			let idArr = [];
			data.forEach(i=>idArr.push(i.id));	
			idArr = JSON.stringify(idArr);
			
			fetch('http://localhost:8081/batchMetaData?ids=' + 
			idArr, {method: "POST"})
			.then( res => { return res.json(); })
			.then( data => {	
				//console.log(data);
				if(data.name && data.name==="Error")
				{
					console.log(data.message);
				}
				else
				{
					this.setState({images:data});
				}
			});			
		});
	}
	
	render() 
	{
		return (			
			<div>
				{	this.state.images === null
					&& <h1 key="loading" id="loading">Loading...</h1>
				}
				{	this.state.images != null
					&& <div key='carousel' id='carousel'>							
							<div key="carouselTopBar" id="carouselTopBar" className='grid-container'>		
								<p key="grid1" className="grid-item">Save to</p>
								<p key="grid2"className="grid-item">Get from</p>
								<p key="grid3"className="grid-item">Move to</p>
							</div>
							<Slider key="slider" {...this.state.sliderProps} id='SliderMain'>								
								{this.state.images.map((item,key)=>									
								<div id="item" key={item.id}>																	
										<h3 id="caption" key='{item.id}h3'>{item.result.path_display}</h3>
											<div className="row" key='{item.id}Row'>
												<div className="column" key='{item.id}yesCol'>
													<button id='yesButton' className="btn btn-success" key='{item.id}yesButton' onClick={()=>this.rebuildSet(item, this.state.database.saveTo)}>
														<HeartFill 
															key='{item.id}Like'
															alt="Like"
															size={150} 
															style={{"paddingTop":"50px",
															"fill":"white"}}>
														</HeartFill>
														<br key='{item.id}yesbr'/>
														<h4 key='{item.id}yesFolder'>{this.state.database.saveTo}</h4>
														{document.onkeydown = this.checkKey}
													</button>
													</div>
													<div className="column" key='{item.id}imgCol'>
													<button key='{item.id}a' href={item.result.preview_url} target='_blank'>
														<img key='{item.id}img' className="center" src={item.result.preview_url.replace('dl=0','dl=1')} alt="Oops! This one didn't load. Try refreshing."/>	
													</button>
													</div>
													<div className="column" key='{item.id}noCol'>
													<button id='noButton' className="btn btn-danger" key='{item.id}noButton' onClick={()=>this.rebuildSet(item, this.state.database.noFolder)}>
														<XSquareFill 
															key='{item.id}Dislike'
															alt="Dislike"
															size={150} 
															style={{"paddingTop":"50px",
															"fill":"white"}}>
														</XSquareFill>
														<br key='{item.id}nobr'/>
														<h4 className='nofolder' key='{item.id}noFolder'>{this.state.database.noFolder}</h4>
													</button>
												</div>
											</div>
									</div>
								)}
							</Slider>
					</div>
				}
			</div>
		);	
	}
}