import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { app } from '../../../firebaseconfig';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import 'font-awesome/css/font-awesome.min.css';

export default function EditRoutine() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');

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
          setEmail(userData.email);
        }
        
      }
    });


    return () => {
      loginClear();
    };
  }, []);

 



  useEffect(() => {
    console.log(postId)
    const fetchPostData = async () => {
      try {
        const postDocRef = doc(db, 'posts', postId);
        const postDocSnap = await getDoc(postDocRef);
  
        if (postDocSnap.exists) {
          const postData = postDocSnap.data();
          setContent(postData.content);
          setImage(postData.image);
        }
      } catch (error) {
        console.error('게시물 데이터 불러오기 실패:', error);
      }
    };
  
    fetchPostData();
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
  
    let imageUrl = image;
    if (image && typeof image !== 'string') {
      imageUrl = await uploadImage(image);
    } else if (!image) {
      imageUrl = '';
    }
  
    try {
      const postDocRef = doc(db, 'posts', postId);
      await updateDoc(postDocRef, {
        content,
        image: imageUrl,
      });
  
      console.log('게시물 수정 완료');
      navigate('/myroutine');
    } catch (error) {
      console.error('게시물 수정 실패:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">수정하기</h2>
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
          게시물 수정
        </button>
      </form>
    </div>
  );
};
