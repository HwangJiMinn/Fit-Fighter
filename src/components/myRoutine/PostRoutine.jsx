import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { app } from '../../../firebaseconfig';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import 'font-awesome/css/font-awesome.min.css';


export default function PostRoutine() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('')

  const db = getFirestore(app);

  useEffect(() => {
    const auth = getAuth();
    const loginClear = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists) {
          const userData = userDocSnap.data();
          setUserName(userData.name);
          setEmail(user.email)
        }
      }
    });

    return () => {
      loginClear();
    };
  }, []);

  

  const uploadImage = async (image) => {
    const storage = getStorage(app);
    const uniqueFileName = `${new Date().getTime()}-${image.name}`;
    const storageRef = ref(storage, `images/${uniqueFileName}`); 
    await uploadBytes(storageRef, image);
    const imageUrl = await getDownloadURL(storageRef);
    return imageUrl;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const displayName = userName

    let imageUrl = '';
    if (image) {
      imageUrl = await uploadImage(image);
    }

    try {
      await addDoc(collection(db, 'posts'), {
        user: displayName,
        content,
        image: imageUrl,
        createdAt: new Date(),
        likes: 0,
        comment: 0,
        email,
        likedBy: [],
      });
      console.log('게시물 작성 완료');
      navigate('/myroutine');
    } catch (error) {
      console.error('게시물 작성 실패:', error);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">오늘의 루틴!</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">이메일</label>
          <input
            disabled
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full"
          />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" type="submit">
          게시물 작성
        </button>
      </form>
    </div>
  );
}
