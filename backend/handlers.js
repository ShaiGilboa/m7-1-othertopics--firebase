'use strict';

const admin = require('firebase-admin');

require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT,
  }),
  databaseURL: process.env.FB_DATABASE_URL,
});

const db = admin.database();

const queryDB = async (key) => {
  const ref = db.ref(key)
  let data = false;
  await ref.once(
    'value',
    (snapshot) => {
      data = snapshot.val();
    },
    (err) => {
      console.log('err',err)
    }
  )

  return data;
}

const getUser = async (email) => {
  const data = (await queryDB('appUsers')) || {};
  const dataValue= Object.keys(data)
    .map(item => data[item])
    .find(obj => obj.email === email)

  return dataValue || false;
};

// const retrieveBtEmail = async (email) => {
//   var ref = db.ref("appUsers");
//   const   ref.orderByChild("email").equalTo(req.body.email).on("child_added", function(snapshot) {
//       console.log('craigcraig',snapshot.key);
//     });
// }

const createUser = async (req, res) => {
  const returningUser = (await getUser(req.body.email));
  console.log('returningUser',returningUser)
  const data = {
    ...req.body,
    isActive: true,
  }
  if (returningUser) {
    console.log('bye');
    var ref = db.ref("appUsers");
    ref.orderByChild("email").equalTo(req.body.email).on("child_added", function(snapshot) {
      console.log('craigcraig',snapshot.key);
      const ref = db.ref('appUsers/'+snapshot.key).update({
        isActive: true,
      })
    });
    res.status(200).json({
      status: 200,
      data: req.body,
      message: 'returning user',
    });
    return;
  } else {
    console.log('craig');
    
    const appUserRef= db.ref('appUsers');
    const newPostKey = await appUserRef.push({
      ...req.body,
      isActive:true,
      }).key
    console.log('newPostKey',newPostKey)
      res.status(200).json({
        status: 200,
        data: {
          ...req.body,
          userId: newPostKey,
          },
        message: 'new user',
      });
    console.log('hi');
    return;
  };

};

const signInHandler = async (userId) => {
  console.log('userId',userId)
  const ref = db.ref('appUsers/'+userId).update({
    isActive: true,
    userId,
  })
  // .then(()=>{
  //   res.status(204).json({status:204})
  // })
}

const signOutHandler = async (req, res) => {
  const {email} = req.body
  var ref = db.ref("appUsers");
  await  ref.orderByChild("email").equalTo(email).on("child_added", function(snapshot) {
      console.log('craigcraig',snapshot.key);
      const ref = db.ref('appUsers/'+snapshot.key).update({
        isActive: false,
      })
    })
  res.status(204).json({status:204})
}

module.exports = {
  createUser,
  getUser,
  signOutHandler,
};
