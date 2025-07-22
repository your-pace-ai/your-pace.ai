import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTypeaheadSuggestions } from '../../api/api'
import "./TypeAheadSearchbar.css"

export const TypeAheadSearchbar = ({ onSearch }) => {
   const [searchTerm, setSearchTerm] = useState('')
   const [isFocused, setIsFocused] = useState(false)
   const [suggestions, setSuggestions] = useState([])
   const [showDropdown, setShowDropdown] = useState(false)
   const [loading, setLoading] = useState(false)
   const [selectedIndex, setSelectedIndex] = useState(-1)
   const debounceRef = useRef(null)
   const dropdownRef = useRef(null)
   const navigate = useNavigate()

   const handleSubmit = (e) => {
       e.preventDefault()
       if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        const selected = suggestions[selectedIndex]
        onSearch(selected.name)
        setSearchTerm(selected.name)
        } else {
            onSearch(searchTerm.trim())
        }
        setShowDropdown(false)
        setSelectedIndex(-1)
   }

   const clearSearch = () => {
       setSearchTerm('')
       setSuggestions([])
       setShowDropdown(false)
       setSelectedIndex(-1)
       onSearch('')
   }

  const fetchSuggestions = async (query) => {
      if (!query.trim()) {
          setSuggestions([])
          setShowDropdown(false)
          return
      }

      setLoading(true)
      try {
          const results = await getTypeaheadSuggestions(query)
          setSuggestions(results.suggestions || [])
          setShowDropdown(true)
          setSelectedIndex(-1)
      } catch (error) {
          setSuggestions([])
          setShowDropdown(false)
      } finally {
          setLoading(false)
      }
  }

  const handleInputChange = (e) => {
      const value = e.target.value
      setSearchTerm(value)

      if (debounceRef.current) {
          clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
          fetchSuggestions(value)
      }, 300)
  }

  const handleKeyDown = (e) => {
      if (!showDropdown || suggestions.length === 0) return

      switch (e.key) {
          case 'ArrowDown':
              e.preventDefault()
              setSelectedIndex(prev =>
                  prev < suggestions.length - 1 ? prev + 1 : 0
              )
              break
          case 'ArrowUp':
              e.preventDefault()
              setSelectedIndex(prev =>
                  prev > 0 ? prev - 1 : suggestions.length - 1
              )
              break
          case 'Escape':
              setShowDropdown(false)
              setSelectedIndex(-1)
              break
      }
  }

  const handleSuggestionClick = (suggestion) => {
      const suggestionName = suggestion.title || suggestion.name || ''
      setSearchTerm(suggestionName)
      setShowDropdown(false)
      setSelectedIndex(-1)

      if (suggestion.type === 'subhub' && suggestion.youtubeUrl) {
          navigate('/subhub', {
              state: {
                  youtubeUrl: suggestion.youtubeUrl,
                  hubName: suggestionName,
                  hubId: suggestion.id,
              }
          })
      } else if (suggestion.type === 'flashcard' || suggestion.type === 'quiz' || suggestion.type === 'chapter') {
          if (suggestion.subHub && suggestion.subHub.youtubeUrl) {
              navigate('/subhub', {
                  state: {
                      youtubeUrl: suggestion.subHub.youtubeUrl,
                      hubName: suggestion.subHub.name,
                      hubId: suggestion.subHub.id,
                  }
              })
          } else {
              onSearch(suggestionName)
          }
      } else {
          onSearch(suggestionName)
      }
  }

  const handleBlur = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget)) {
          return
      }
      setIsFocused(false)
      setTimeout(() => setShowDropdown(false), 150)
  }

  useEffect(() => {
      return () => {
          if (debounceRef.current) {
              clearTimeout(debounceRef.current)
          }
      }
  }, [])

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
                       onChange={handleInputChange}
                       onFocus={() => setIsFocused(true)}
                       onBlur={handleBlur}
                       onKeyDown={handleKeyDown}
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

        {showDropdown && (loading || suggestions.length > 0) && (
              <div ref={dropdownRef} className="suggestions-dropdown">
                  {loading ? (
                      <div className="suggestion-item loading">
                          <div className="suggestion-loading">Searching...</div>
                      </div>
                  ) : (
                      suggestions.map((suggestion, index) => (
                          <div
                              key={`${suggestion.type}-${suggestion.id}-${index}`}
                              className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                              onClick={() => handleSuggestionClick(suggestion)}
                              onMouseEnter={() => setSelectedIndex(index)}
                          >
                              <div className="suggestion-content">
                                  <div className="suggestion-name">{suggestion.title || suggestion.name}</div>
                                  <div className="suggestion-category">{suggestion.type?.toUpperCase()}</div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          )}
      </div>
  )
}
