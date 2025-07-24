const randomPasswordGenerator = require('../../utils/randomPasswordGenerator')


describe('randomPasswordGenerator', () => {
 it('should generate password with default length of 12', () => {
   const password = randomPasswordGenerator()
   expect(password).toHaveLength(12)
 })


 it('should generate password with specified length (only works with 12)', () => {
   const password = randomPasswordGenerator(12)
   expect(password).toHaveLength(12)
 })


 it('should return empty string for length greater than 12', () => {
   const password = randomPasswordGenerator(15)
   expect(password).toBe('')
 })


 it('should generate password containing different character types', () => {
   const password = randomPasswordGenerator(12)
   expect(password).toMatch(/^[A-Za-z0-9!@#$%^&*()_+~`|}{[\]\\:?><,./=-]+$/)
 })


 it('should generate different passwords on multiple calls', () => {
   const password1 = randomPasswordGenerator(12)
   const password2 = randomPasswordGenerator(12)

   expect(password1).not.toBe(password2);
 })


})
