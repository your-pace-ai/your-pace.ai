const randomPasswordGenerator = (len=12) => {
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowerCase = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const specialChars = "!@#$%^&*()_+~`|}{[]\\:;?><,./-="

    const fields = [upperCase, lowerCase, numbers, specialChars]
    let password = ""

    if (len > 12) {
        return ""
    }

    for (let i = 0; i < len; i += 1) {
        const randomField = Math.floor(Math.random() * 4)
        const randomIndexOfField = Math.floor(Math.random() * fields[randomField].length)
        password += fields[randomField][randomIndexOfField]
    }

    if (len < 12) password = randomPasswordGenerator(len)
    return password
}

module.exports = randomPasswordGenerator
