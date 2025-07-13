// using dynamic import to avoid circular dependency
const fetch = async (...args) => {
   const { default: fetch } = await import('node-fetch')
   return fetch(...args)
}

module.exports = fetch
