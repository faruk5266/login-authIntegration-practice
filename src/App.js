import React, { useState } from 'react';
import * as firebase from "firebase/app";
import "firebase/auth";
import './App.css';
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: ''
  })

  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSingIn = ()=>{
    firebase.auth().signInWithPopup(provider)
  .then(res => {
    const {displayName, photoURL, email} = res.user;
        const singInUser ={
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(singInUser);
  })
  .catch(err => {
    console.log(err);
    console.log(err.message)
  })
  }

  const handleFbSingIn= () => {
    firebase.auth().signInWithPopup(fbProvider) 
    .then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log('update fb sign in',user);
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  const handleSingOut= () => {
    firebase.auth().signOut()
    .then(res => {
      const singOutUser ={
        isSignedIn: false,
        name: '',
        email: '',
        error: '',
        success: false,
        photo: ''
      }
      setUser(singOutUser)
    })
    .catch(err => {
      
    })
  }
  const handleBlur= (e) => {
      
      let isFieldValid = true;
      if(e.target.name === 'email'){
         isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
         }
      if(e.target.name === 'password'){
        const isPasswordValid = e.target.value.length > 6;
        const isPasswordHas = /^(?=.{6,20}$)\D*\d/.test(e.target.value)
        isFieldValid= isPasswordHas && isPasswordValid
      }
     if(isFieldValid){  
        // const [...cart, newItem]
            const newUserInfo = {...user};
            newUserInfo[e.target.name] = e.target.value;
            setUser(newUserInfo);
     }
  }
  const handleSubmit= (e) => {
        if(newUser && user.email && user.password){
          firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
          .then(res => {
              const newUserInfo = {...user}
              newUserInfo.error = ''
              newUserInfo.success= true
           setUser(newUserInfo);
           updateUserName(user.name);
          })
          .catch( error => {
            
            const newUserInfo = {...user};
            newUserInfo.error = error.message;
            newUserInfo.success= false;
            setUser(newUserInfo);
            // ...
           
          });
        }
        if(!newUser && user.email && user.password){
          firebase.auth().signInWithEmailAndPassword(user.email, user.password)
          .then(res => {
            const newUserInfo = {...user}
              newUserInfo.error = ''
              newUserInfo.success= true
           setUser(newUserInfo);
          })
          .catch(function(error) {
            const newUserInfo = {...user};
            newUserInfo.error = error.message;
            newUserInfo.success= false;
            setUser(newUserInfo);
          });
        }

        e.preventDefault();
  }
    const updateUserName = name => {
      const user = firebase.auth().currentUser;

user.updateProfile({
  displayName: {name}
      }).then(function() {
       console.log('Updated Successfully')
      }).catch(function(error) {
        console.log(error)  
      });
    }
  return (
    <div className="App">
   
   
      {
        user.isSignedIn ? <button onClick={handleSingOut }>Sign Out</button> :<button onClick={handleSingIn }>Sign in</button>
      }
      <br/>
      <button onClick={handleFbSingIn}>Sing in with Facebook</button>
      {
        user.isSignedIn && <div>     
          <p>Welcome, {user.name} </p>
          <p>Your Email: {user.email}</p>
          <img src={user.photo} alt=""/>
        </div>
     }

        <h1>Our Own Authentication System</h1>
        <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
        <label htmlFor="newUser">NewUser singUp </label>
        <form onSubmit={handleSubmit}>
       {newUser &&  <input type="text" name="name" onBlur={handleBlur} placeholder="Put your Name"/>}
        <br/>
          <input type="text" name="email" onBlur={handleBlur} placeholder="Put your email address" required/>
          <br/>
          <input type="password" name="password" onBlur={handleBlur} placeholder="Set password"  required/>  
          <br/>
          <input type="submit" value={newUser ?'Sing up':'Sing in'}/>
        </form>
      <p style={{color: 'red'}}>{user.error}</p>
      {user.success && <p style={{color: 'green'}}>User {newUser ?'created':'Logged in'} successfully</p>}
    </div>
  );
}

export default App;
