const { dataSource } = require('../db/data-source')

/**
 * Jest global teardown - runs once after all test suites
 * Closes TypeORM connection to prevent hanging connections
 */
module.exports = async () => {
  console.log('\n🧹 Cleaning up database connections...')

  try {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
      console.log('✅ TypeORM DataSource closed\n')
    }
  } catch (error) {
    console.error('❌ Failed to close database connection:', error)
    // Don't throw - allow tests to complete even if cleanup fails
  }
}
