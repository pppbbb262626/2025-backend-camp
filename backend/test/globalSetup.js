const { dataSource } = require('../db/data-source')

/**
 * Jest global setup - runs once before all test suites
 * Ensures TypeORM connection is initialized and tables are created
 */
module.exports = async () => {
  console.log('\n🔧 Initializing database for tests...')

  try {
    // Initialize TypeORM connection
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
      console.log('✅ TypeORM DataSource initialized')
    }

    // Wait for schema synchronization to complete
    // The synchronize option in config will auto-create tables
    if (dataSource.options.synchronize) {
      console.log('✅ Database schema synchronized')
    }

    console.log('✅ Database ready for testing\n')
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    throw error
  }
}
