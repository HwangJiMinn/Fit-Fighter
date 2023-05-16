import React from 'react';

const Pagination = ({ currentPage, changePage, hasMorePosts }) => {

  // 페이지네이션 구현
  return (
    <div className="flex justify-center">
      {currentPage > 1 && (
        <button
          onClick={() => changePage(currentPage - 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mx-2"
        >
          이전 페이지
        </button>
      )}
      {hasMorePosts && (
        <button
          onClick={() => changePage(currentPage + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mx-2"
        >
          다음 페이지
        </button>
      )}
    </div>
  );
};

export default Pagination;