import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore ,collection, addDoc } from 'firebase/firestore'
import { app } from '../../../firebaseconfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function PostMyFood() {
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [ingredients, setIngredients] = useState('');
    const [recipe, setRecipe] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('')

  const navigate = useNavigate();
  const db = getFirestore(app);

  // 유저 정보 가져오기
  useEffect(() => {
    const auth = getAuth();
    const loginClear = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists) {
          const userData = userDocSnap.data();
          setUserName(userData.name);
          setUserEmail(userData.email)
        }
        
      }
    });


    return () => {
      loginClear();
    };
  }, []);

  
  // fireStorage 이미지 저장
  const uploadImage = async (image) => {
    const storage = getStorage(app);
    const uniqueFileName = `${new Date().getTime()}-${image.name}`;
    const storageRef = ref(storage, `myfood/${uniqueFileName}`);
    await uploadBytes(storageRef, image);
    const imageUrl = await getDownloadURL(storageRef);
    return imageUrl;
  };


  // 게시물 작성 시 firestore에 myfood로 저장
  const handleSubmit = async (e) => {
    e.preventDefault();


    let imageUrl = ''
    if (image) {
      imageUrl = (await uploadImage(image));
    }

    try {
      await addDoc(collection(db, 'myfood'), {
        title,
        image: imageUrl,
        ingredients,
        recipe,
        createdAt: new Date(),
        user : userName,
        email : userEmail,
        likes : 0,
        likedBy : [],
      });
      console.log('게시물 작성 완료');
      navigate('/myfood');
    } catch (e) {
      console.error('게시물 작성 실패:', e);
    }

    
  };



  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">나만의 레시피!</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title" className="block text-xl mb-2">
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-2 border-gray-300 p-2 rounded-md mb-4"
          required
        />

        <label htmlFor="image" className="block text-xl mb-2">
          사진
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full border-2 border-gray-300 p-2 rounded-md mb-4"
          required
        />

        <label htmlFor="ingredients" className="block text-xl mb-2">
          재료
        </label>
        <textarea
          id="ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="w-full border-2 border-gray-300 p-2 rounded-md mb-4"
          rows="5"
          required
        ></textarea>

        <label htmlFor="recipe" className="block text-xl mb-2">
          레시피
        </label>
        <textarea
          id="recipe"
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
          className="w-full border-2 border-gray-300 p-2 rounded-md mb-4"
          rows="10"
          required
        ></textarea>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          게시물 작성
        </button>
      </form>
    </div>
  );
}