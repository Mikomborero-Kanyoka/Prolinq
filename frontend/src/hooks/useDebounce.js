import { useEffect, useState } from 'react'

/**
 * ENHANCEMENT: Custom debounce hook for job search
 * 
 * This hook delays callback execution until after a specified delay has passed
 * without any new changes. Used to prevent excessive API calls during typing.
 * 
 * @param {*} value - The value to debounce
 * @param {number} delay - The debounce delay in milliseconds (default: 300ms)
 * @returns {*} The debounced value
 * 
 * @example
 * const debouncedSearchQuery = useDebounce(searchQuery, 300)
 * useEffect(() => {
 *   if (debouncedSearchQuery) {
 *     performSearch(debouncedSearchQuery)
 *   }
 * }, [debouncedSearchQuery])
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce