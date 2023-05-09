import React from 'react'
import { useState } from 'react'

export default function FoodPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  

  const gpt = async (e) => {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
              Authorization: `Bearer ${import.meta.env.VITE_CHATGPTAPI}`,
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: `"${e}}" 탄수화물, 단백질, 지방, 열량 알려줘` }],
          }),
      });

      const data = await response.json();
      const answer = data.choices[0].message.content;
      return answer.split('\n').filter((suggestion) => suggestion !== '')
  }
  
  const searchFood =  async (query) => {
      try{
          const suggestion = await gpt(query)
          return suggestion
      }catch (error){
          console.error('Error searching food:', error);
          return [];
      }
  }
  
  const change = (e) => {
      setSearchQuery(e.target.value);
  }

  const submit = async (e) => {
      e.preventDefault()
      if(searchQuery.trim() !== '') {
        setIsLoading(true)  
        const results = await searchFood(searchQuery)
        setSearchResult(results)
        setIsLoading(false)
      }
  }
  
  return (
      <div className="container mx-auto mt-20 max-w-md">
        <h1 className="text-2xl font-bold mb-5 text-center">음식 성분 검색</h1>
        <form onSubmit={submit} className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={change}
            placeholder="음식 검색..."
            className="w-full p-2 rounded-md mb-4 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-150 ease-in-out"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            검색
          </button>
        </form>
        {isLoading && (
          <div className="flex justify-center items-center my-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {searchResult.length > 0 && (
          <ul className="bg-white shadow-md rounded-md p-4">
            {searchResult.map((result, index) => (
              <li key={index} className="mb-2 border-b border-gray-200 py-2">
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>
  );
}
