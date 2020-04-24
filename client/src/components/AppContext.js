import React, { createContext, useEffect, useState } from 'react';
import withFirebaseAuth from 'react-with-firebase-auth';
import * as firebase from 'firebase';
import 'firebase/auth';

export const AppContext = createContext(null);

const firebaseConfig = {
    apiKey: "AIzaSyCxjmpp1sAy-b9Bn4PWf14T1qndYS29qIc",
    authDomain: "user-app-d6921.firebaseapp.com",
    databaseURL: "https://user-app-d6921.firebaseio.com",
    project_id: "user-app-d6921",
    storageBucket: "user-app-d6921.appspot.com",
    messagingSenderId: "327594813192",
    appId: "1:327594813192:web:ea4ddf350dd2491aa1aebd"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseAppAuth = firebaseApp.auth();

const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};

const AppProvider = ({ children, signInWithGoogle, signOut, user }) => {
  const [appUser, setAppUser] = useState({});
  const [message, setMessage] = useState('');
  const [change, setChange] = useState(0)
  const handleSignOut= () => {
    signOut();
    console.log('appUser',appUser)
    const body = {
      email: appUser.email,
    }
    fetch('/signOut', {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify(body),
    })
    .then(res=>{
      if(res.status===204)setAppUser({})
      })
    // .then(status=>{
    //   console.log('status',status)
    //   setAppUser({});
    // })
  }

  React.useEffect(() => {
    // this connects us to the database, specifically the appUsers obj
    const appUsersRef = firebase.database().ref(`appUsers`);
    appUsersRef.on('value', (snapshot) => {
      // console.log('snapshot',snapshot)
      // console.log('snapshot.exists()',snapshot.exists())
      const appUsers = snapshot.val();
      // if we had a state item that was tracking allUsers, we would update it here.
      // setAllUsers(appUsers);
      if(Object.keys(appUsers).length !== change) {
        // console.log('change',change)
        // console.log('Object.keys(appUsers)',Object.keys(appUsers).length)
        setChange(Object.keys(appUsers).length)
        }
      // console.log('appUsers',appUsers)
      let newchange = change+1;
      // console.log('newchange',newchange)
      // setChange(newchange)
    })

    return () => {
      // this is where we need to turn off the connection. It's always good to clean up after oursleves.
      const appUsersRef = firebase.database().ref(`appUsers`);
      appUsersRef.off();
    };
  },[change])

  useEffect(()=>{
    console.log('useEffect change');
  },[change])

  useEffect(() => {
    if (user){
      console.log('ignin');
      
      fetch(`/users`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }),
      })
        .then(res => res.json())
        .then(json => {
          console.log('json',json)
          setAppUser(json.data);
          setMessage(json.message);
        })
    }
  }, [user]);

  return (
    <AppContext.Provider value={{
      appUser,
      signInWithGoogle,
      handleSignOut,
      message,
      change,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export default withFirebaseAuth({
    providers,
    firebaseAppAuth,
  })(AppProvider);