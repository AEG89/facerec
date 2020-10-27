import React from 'react';
import Navigation from './componant/navigation/navigation'
import SignIn from './componant/SignIn/SignIn'
import Register from './componant/Register/Register'
import Logo from './componant/Logo/Logo' 
import ImageLinkForm from './componant/ImageLinkForm/ImageLinkForm' 
import Rank from './componant/Rank/Rank' 
import FaceRecognition from './componant/FaceRecognition/FaceRecognition'
import './App.css';
import Particles from 'react-particles-js';




const particleOptions ={
  particles: {
  number:{
    value:30,
    density:{
      enable: true,
      value_area: 200
    }
  } 
}
}


const initialState =  {
      input: '',
      imageUrl:'',
      box: {},
      route : 'SignIn',
      isSignedIn : false,
      user:{
        id:0,
        name:' ',
        email:" ",
        entries: 0,
        joined: ' '
      }     
    }         



class App extends React.Component{
  constructor(){
    super();
    this.state = initialState;
  }
 
  // componentDidMount(){
  //   fetch('http://localhost:3000')
  //   .then(response => response.json())
  //   .then(console.log)

  // }

  loadUser = (data) =>{
    this.setState({user:{
      id: data.id,
      name: data.name,
      email:data.email,
      entries: data.entries,
      joined: data.joined 
    }
    })
  }

  calculateFaceLocation = (data) => {
  const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box  
  console.log(clarifaiFace);
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);
  console.log(width,height);
    return{
      leftCol : clarifaiFace.left_col * width,
      topRow  : clarifaiFace.top_row * height, 
      rightCol  : width - (clarifaiFace.right_col * width),
      bottomRow : height - (clarifaiFace.bottom_row * height)  
    }
  }   

  displayFaceBox = (box) => {
    this.setState({box : box});
    console.log(box);

  } 

  onInputChange = (event) => {
    this.setState({input:event.target.value});
  }

  onRouteChange = (route) =>{
    if(route==='signout'){
      this.setState(initialState);  
    } else if (route==='home') {
      this.setState({isSignedIn:true});
    }
    this.setState({route:route});
  }

  onButtonSubmit = () =>{
    //console.log('submit');
    this.setState({imageUrl:this.state.input});
    // this.setState({input : ''});
    console.log("1");

    fetch('http://localhost:3000/imageurl',{
          method : 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          input : this.state.input
        })

    }).then(response => response.json()) 
    .then(response => {
      console.log("response ok");        
      if(response){
        fetch('http://localhost:3000/image',{
          method : 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          id : this.state.user.id
        })

      })
        .then(response => response.json())
        .then(count => {
          this.setState({user:{
            name:this.state.user.name,
            entries:count,
            id:this.state.user.id
          }})

        })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
      .catch(err => console.log(err));
  }

  render(){
  const {isSignedIn,box,imageUrl,route}=this.state;
  return (
    <div>
    <div className="App">
      <Particles className='particle'
      params={particleOptions} />
      <Navigation isSignedIn={isSignedIn} onRouteChange = {this.onRouteChange}/>
      {
        route === 'home'
        ?  <div> 
            <Logo/>
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm 
          onInputChange={this.onInputChange}
          onButtonSubmit={this.onButtonSubmit}
          />
          <FaceRecognition box={box} imageUrl={imageUrl}   />
          </div>
         :
        (
          route === 'SignIn' 
          ? <SignIn loadUser={this.loadUser} onRouteChange = {this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange = {this.onRouteChange} />
        )
      }
    </div>
    </div>
  );
  }

}
export default App;
