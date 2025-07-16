import { useState } from 'react'
import "./TypeAheadSearchbar.css"

export const TypeAheadSearchbar = ({ onSearch }) => {
   const [searchTerm, setSearchTerm] = useState('')
   const [isFocused, setIsFocused] = useState(false)

   const handleSubmit = (e) => {
       e.preventDefault()
       onSearch(searchTerm.trim())
   }

   const clearSearch = () => {
       setSearchTerm('')
       onSearch('')
   }

   return (
       <div className={`search-bar-container ${isFocused ? 'focused' : ''}`}>
           <form onSubmit={handleSubmit} className="search-form">
               <div className="search-input-wrapper">
                   <svg
                       className="search-icon"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                   >
                       <circle cx="11" cy="11" r="8"></circle>
                       <path d="m21 21-4.35-4.35"></path>
                   </svg>

                   <input
                       type="text"
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                       onFocus={() => setIsFocused(true)}
                       onBlur={() => setIsFocused(false)}
                       placeholder="Search..."
                       className="search-input"
                       autoComplete="off"
                   />

                   {searchTerm && (
                       <button
                           type="button"
                           onClick={clearSearch}
                           className="clear-button"
                           aria-label="Clear search"
                       >
                           <svg
                               viewBox="0 0 24 24"
                               fill="none"
                               stroke="currentColor"
                               strokeWidth="2"
                           >
                               <line x1="18" y1="6" x2="6" y2="18"></line>
                               <line x1="6" y1="6" x2="18" y2="18"></line>
                           </svg>
                       </button>
                   )}
               </div>
           </form>
       </div>
   )
}
