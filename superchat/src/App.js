import React from 'react';
import './App.css';

// debugging potential issue with import/export components are not working as expected
// import firebase from 'firebase/app'; // original
// import 'firebase/firestore';
// import 'firebase/auth';
import firebase from 'firebase/compat/app'; // https://stackoverflow.com/questions/65658510/export-firestore-imported-as-firebase-was-not-found-in-firebase-after-up
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import {useAuthState} from 'react-firebase-hooks/firestore';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// firebase.initializeApp({
//   apiKey: "AIzaSyAumiSwMUgDObI2mBehlag7GAAwZpNNsZE",
//   authDomain: "superchat-460ec.firebaseapp.com",
//   projectId: "superchat-460ec",
//   storageBucket: "superchat-460ec.appspot.com",
//   messagingSenderId: "391734950169",
//   appId: "1:391734950169:web:cc0a85eaf06583eb20ed88",
//   measurementId: "G-7YX74V71DK"
// });

const firebaseConfig = {
  apiKey: "AIzaSyAumiSwMUgDObI2mBehlag7GAAwZpNNsZE",
  authDomain: "superchat-460ec.firebaseapp.com",
  projectId: "superchat-460ec",
  storageBucket: "superchat-460ec.appspot.com",
  messagingSenderId: "391734950169",
  appId: "1:391734950169:web:cc0a85eaf06583eb20ed88",
  measurementId: "G-7YX74V71DK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">

      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  )
}

function SignIn() {
  const SignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.SignInWithPopup(provider);
  }

  return (
    <button onClick={SignInWithGoogle}>Sign in w/ Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(30);
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    await messageRef.add({ // send message to db
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">Send</button>
      </form>

    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={'message ${messageClass}'}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

export default App;
