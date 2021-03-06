import React, { useRef, useState } from 'react';
import './App.css';
import CrossBrowser from './CrossBrowser';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
// import 'firebase/analytics';

import * as FaIcons from 'react-icons/fa';
import * as FcIcons from 'react-icons/fc';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
});

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();

function App() {
  // Android, ios ํ์ธ

  const [user] = useAuthState(auth);
  return (
    <div className='App'>
      <header>
        <h4> ๐ ์์์ ๋น์ด์ฃผ์ธ์</h4>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  CrossBrowser();
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>
        <FcIcons.FcGoogle />
        <span> </span>

        <span>
          <b>๊ตฌ๊ธ๋ก ๋ก๊ทธ์ธํ๊ธฐ</b>
        </span>
      </button>
      <span className='notice'>
        ๐ ์์ดํฐ(ios)์ safari, chrome <br />
        ๋ฑ์ผ๋ก ๋ก๊ทธ์ธ ํด์ฃผ์ธ์. ๐
      </span>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className='sign-out' onClick={() => auth.signOut()}>
        <b>๋ก๊ทธ์์</b>
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(500);

  const [messages] = useCollectionData(query, { idFiled: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder=''
        />
        <button type='submit' disabled={!formValue}>
          <FaIcons.FaPaperPlane />
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
