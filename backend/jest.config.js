module.exports = {
 testEnvironment: 'node',
 testMatch: ['**/__tests__/**/*.test.js'],
 collectCoverageFrom: [
   'routes/**/*.js',
   'utils/**/*.js',
   'middleware/**/*.js',
   'cache/**/*.js',
   'typeAhead/**/*.js',
   'recommendationAlgo/**/*.js',
   'strategies/**/*.js'
 ],
 coverageDirectory: 'coverage',
 setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
}
