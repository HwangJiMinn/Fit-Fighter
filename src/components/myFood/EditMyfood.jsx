import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app } from "../../../firebaseconfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function EditMyfood() {
  const { postId } = useParams();
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const navigate = useNavigate();
  const db = getFirestore(app);

  // 게시물의 데이터 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDocRef = doc(db, "myfood", postId);
        const postDocSnap = await getDoc(postDocRef);
        if (postDocSnap.exists) {
          const postData = postDocSnap.data();
          setTitle(postData.title);
          setCurrentImage(postData.image);
          setIngredients(postData.ingredients);
          setRecipe(postData.recipe);
        }
      } catch (error) {
        console.error("게시물 가져오기 실패:", error);
      }
    };

    fetchPost();

    // 유저 이름과 이메일 firestore에서 가져오기
    const auth = getAuth();
    const loginClear = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists) {
          const userData = userDocSnap.data();
          setUserName(userData.name);
          setUserEmail(userData.email);
        }
      }
    });

    return () => {
      loginClear();
    };
  }, [postId]);

  // 이미지를 firestorage에 저장
  const uploadImage = async (image) => {
    const storage = getStorage(app);
    const uniqueFileName = `${new Date().getTime()}-${image.name}`;
    const storageRef = ref(storage, `myfood/${uniqueFileName}`);
    await uploadBytes(storageRef, image);
    const imageUrl = await getDownloadURL(storageRef);
    return imageUrl;
  };

  // 이미지 삭제
  const deleteImage = async (imageUrl) => {
    const storage = getStorage(app);
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  };


  // 게시물 수정 구현
  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = currentImage;
    if (image) {
      imageUrl = await uploadImage(image);
      if (currentImage) {
        await deleteImage(currentImage);
      }
    }

    try {
      const postDocRef = doc(db, "myfood", postId);
      await updateDoc(postDocRef, {
        title,
        image: imageUrl,
        ingredients,
        recipe,
      });
      console.log("게시물 수정 완료");
      navigate(`/myfoodpage/${postId}`);
    } catch (e) {
      console.error("게시물 수정 실패:", e);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">나만의 레시피 수정</h1>
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
          게시물 수정
        </button>
      </form>
    </div>
  );
}
