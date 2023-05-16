import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  where,
  doc,
  writeBatch
} from "firebase/firestore";
import { app } from "../../../firebaseconfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const maxContent = 5; // 한 페이지당 최대 게시물 수
const maxButton = 5; // 최대 페이지 버튼 수

export default function MyFood() {
  const [myFoodPosts, setMyFoodPosts] = useState([]);
  const [lastPost, setLastPost] = useState(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("createdAt");

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const maxPage = Math.ceil(myFoodPosts.length / maxContent);

  const nav = useNavigate();
  const db = getFirestore(app);


  // 게시물 가져오기
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      }
    });
    fetchPosts();
  }, [currentPage, sortOption]);


  // 페이지 검색 기능 구현
  const fetchPosts = async () => {
    let myFoodQueryByTitle;
    let myFoodQueryByAuthor;
  
    if (searchTerm === "") {
      myFoodQueryByTitle = query(
        collection(db, "myfood"),
        orderBy(sortOption, "desc")
      );
      myFoodQueryByAuthor = query(
        collection(db, "myfood"),
        orderBy(sortOption, "desc")
      );
    } else {
      myFoodQueryByTitle = query(
        collection(db, "myfood"),
        where("title", "==", searchTerm),
        orderBy(sortOption, "desc")
      );
      myFoodQueryByAuthor = query(
        collection(db, "myfood"),
        where("user", "==", searchTerm),
        orderBy(sortOption, "desc")
      );
    }
  
    const myFoodSnapByTitle = await getDocs(myFoodQueryByTitle);
    const myFoodSnapByAuthor = await getDocs(myFoodQueryByAuthor);
  
    if (myFoodSnapByTitle.empty && myFoodSnapByAuthor.empty) {
      setHasMorePosts(false);
      return;
    }
  
    setLastPost(myFoodSnapByTitle.docs[myFoodSnapByTitle.docs.length - 1]);
    setMyFoodPosts(
      [
        ...myFoodSnapByTitle.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ...myFoodSnapByAuthor.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ].filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i) // remove duplicates
    );
  };

  const handleSearch = () => {
    fetchPosts();
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const createPost = () => {
    nav("/postmyfood");
  };

  const changePage = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const goToPost = (postId) => {
    nav(`/myfoodpage/${postId}`);
  };


  // 커뮤니티에 게시물 렌더링
  const renderContent = () => {
    const start = (currentPage - 1) * maxContent;
    const end = Math.min(currentPage * maxContent, myFoodPosts.length);
    return myFoodPosts.slice(start, end).map((post) => (
      <div
        key={post.id}
        className="border border-gray-300 p-4 rounded-md mb-4 flex cursor-pointer"
        onClick={() => goToPost(post.id)}
      >
        <div className="mr-4">
          <img
            src={post.image}
            alt={post.title}
            className="w-24 h-24 object-cover rounded"
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
          <div>작성자: {post.user}</div>
          <div>
            작성일: {new Date(post.createdAt.toMillis()).toLocaleString()}
          </div>
          <div>
            추천수:{" "}
            <span className="font-semibold text-red-700">
              {post.likedBy ? post.likedBy.length : 0}
            </span>
          </div>
        </div>
        {currentUserEmail === post.email && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deletePost(post.id);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md ml-auto"
          >
            삭제
          </button>
        )}
      </div>
    ));
  };


  // 게시물 삭제 구현
  const deletePost = async (postId) => {
    if (window.confirm("이 게시물을 삭제하시겠습니까?")) {
      try {
        const postRef = doc(db, "myfood", postId);
        const commentsRef = collection(db, "myfood", postId, "comments");
  
        const commentsSnapshot = await getDocs(commentsRef);
        const batch = writeBatch(db);
        commentsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
  
        batch.delete(postRef);
  
        await batch.commit();
  
        setMyFoodPosts(myFoodPosts.filter((post) => post.id !== postId));
      } catch (e) {
        console.error("게시물 삭제 실패:", e);
      }
    }
  };

  // 페이지네이션 버튼 구현
  const renderButtons = () => {
    const start = Math.max(1, currentPage - Math.floor(maxButton / 2));
    const end = Math.min(maxPage, start + maxButton - 1);
    const buttons = [];

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => changePage(i)}
          className={`bg-blue-500 text-white px-4 py-2 rounded-md mx-2 ${
            currentPage === i ? "active" : ""
          }`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="container mx-auto p-4 flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="mb-4 flex">
          <input
            type="text"
            placeholder="제목 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-2 rounded-md flex-grow"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2"
          >
            검색
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="sortOption">정렬 방식: </label>
          <select
            id="sortOption"
            value={sortOption}
            onChange={handleSortChange}
            className="border border-gray-300 p-2 rounded-md"
          >
            <option value="createdAt">최신순</option>
            <option value="likedBy">추천수</option>
          </select>
          <button
            onClick={createPost}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 float-right"
          >
            게시물 작성
          </button>
        </div>
        {renderContent()}
      </div>
      <div className="flex justify-center mb-20">
        {currentPage > 1 && (
          <button
            onClick={() => changePage(currentPage - 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mx-2"
          >
            이전 페이지
          </button>
        )}
        {renderButtons()}
        {currentPage < maxPage && (
          <button
            onClick={() => changePage(currentPage + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mx-2"
          >
            다음 페이지
          </button>
        )}
      </div>
    </div>
  );
}
