import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { app } from "../../../firebaseconfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function MyFoodPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [liked, setLiked] = useState(false);
  
  useEffect(() => {
    if (user && post && (post.likedBy || []).includes(user.email)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [user, post]);

  const navigate = useNavigate();

  const db = getFirestore(app);
  const auth = getAuth();

  useEffect(() => {
    const auth = getAuth();
    const loginClear = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists) {
          const userData = userDocSnap.data();
          setUserName(userData.name);
        }
      }
    });

    return () => {
      loginClear();
    };
  }, []);

  useEffect(() => {
    fetchPost();
    fetchComments();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          displayName: user.displayName,
          email: user.email,
          uid: user.uid,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const postDocRef = doc(db, "myfood", postId);
      const postDocSnap = await getDoc(postDocRef);
      if (postDocSnap.exists) {
        setPost({ id: postDocSnap.id, ...postDocSnap.data() });
      }
    } catch (error) {
      console.error("게시물 가져오기 실패:", error);
    }
  };

  const handleEditPost = () => {
    navigate(`/editmyfood/${postId}`);
  };

  const handleDeletePost = async () => {
    if (window.confirm("이 게시물을 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "myfood", postId));
        navigate("/myfood");
      } catch (error) {
        console.error("게시물 삭제 실패:", error);
      }
    }
  };

  const fetchComments = async () => {
    try {
      const commentsQuery = query(
        collection(db, "myfood", postId, "comments"),
        orderBy("createdAt")
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = commentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    } catch (error) {
      console.error("댓글 가져오기 실패:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await addDoc(collection(db, "myfood", postId, "comments"), {
        postId,
        content: commentContent,
        createdAt: new Date(),
        user: userName,
        userId: user.uid,
      });
      setCommentContent("");
      fetchComments();
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await deleteDoc(doc(db, "myfood", postId, "comments", commentId));
      fetchComments();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  if (!post) {
    return <div>로딩중...</div>;
  }



  const handleLike = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const postRef = doc(db, "myfood", postId);
      if (liked) {
        await updateDoc(postRef, {
          likes: post.likes - 1,
          likedBy: arrayRemove(user.email),
        });
      } else {
        await updateDoc(postRef, {
          likes: post.likes + 1,
          likedBy: arrayUnion(user.email),
        });
      }
      setLiked(!liked);
      fetchPost();
    } catch (error) {
      console.error("추천 실패:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap justify-between mb-4">
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl">{post.title}</h1>
        </div>
        <div className="w-full md:w-1/2 text-right md:text-right">
          <div>작성자: {post.user}</div>
          <div>
            작성일: {new Date(post.createdAt.toMillis()).toLocaleString()}
          </div>
          {user && user.email === post.email && (
            <>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                onClick={handleEditPost}
              >
                수정
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md "
                onClick={handleDeletePost}
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center mb-4">
        <img
          src={post.image}
          alt={post.title}
          className="object-contain rounded mb-4"
          style={{ maxWidth: "700px", maxHeight: "700px" }}
        />
      </div>
      <div className="w-full text-center">
        <h2 className="text-2xl mb-2">재료</h2>
        <p
          className="border-2 border-gray-300 p-4 rounded-md mb-4 whitespace-pre-wrap mx-auto"
          style={{ maxWidth: "700px" }}
        >
          {post.ingredients}
        </p>
      </div>
      <div className="w-full text-center">
        <h2 className="text-2xl mb-2">레시피</h2>
        <p
          className="border-2 border-gray-300 p-4 rounded-md mb-4 whitespace-pre-wrap mx-auto"
          style={{ maxWidth: "700px" }}
        >
          {post.recipe}
        </p>
      </div>
      <div className="w-full text-center mb-4">
        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
            liked ? "bg-blue-500" : "bg-red-500"
          }`}
          onClick={handleLike}
        >
          추천 {post.likes}
        </button>
      </div>
      <div className="w-full">
        <h2 className="text-2xl mb-2">댓글</h2>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            className="w-full border-2 border-gray-300 p-2 rounded-md mb-4"
            rows="3"
            required
          ></textarea>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            댓글 작성
          </button>
        </form>
        <div>
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-gray-300 mb-4 pb-4"
            >
              <p className="mb-2">{comment.content}</p>
              <div className="text-sm text-gray-600">
                <span>작성자: {comment.user}</span>
                <span className="mx-2">|</span>
                <span>
                  작성일:{" "}
                  {new Date(comment.createdAt.toMillis()).toLocaleString()}
                </span>
                {user && user.uid === comment.userId && (
                  <button
                    onClick={() => handleCommentDelete(comment.id)}
                    className="ml-4 text-red-500"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
