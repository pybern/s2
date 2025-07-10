export interface SqlResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
  executionTime?: number;
}

export interface SafeSqlOptions {
  timeout?: number; // in milliseconds
  maxRows?: number;
  allowedStatements?: string[];
}

const DEFAULT_OPTIONS: SafeSqlOptions = {
  timeout: 30000, // 30 seconds
  maxRows: 1000,
  allowedStatements: ['SELECT', 'WITH'] // Only allow read operations
};

/**
 * Executes a SQL query safely with validation and limits using API
 */
export async function runSafeSql(
  query: string,
  options: SafeSqlOptions = {}
): Promise<SqlResult> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  
  try {
    const response = await fetch('/api/execute-sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        options: mergedOptions
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to execute query',
        executionTime: Date.now() - startTime
      };
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    let errorMessage = 'Network error or server unavailable';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
      executionTime
    };
  }
}

/**
 * Example usage function with the sample query
 */
export async function executeSampleQuery(): Promise<SqlResult> {
  const sampleQuery = `
    SELECT a.name, 'Savings' AS account_type, s.balance
    FROM accounts a
    JOIN savings s ON a.customer_id = s.customer_id
    UNION ALL
    SELECT a.name, 'Checking' AS account_type, c.balance
    FROM accounts a
    JOIN checking c ON a.customer_id = c.customer_id
    ORDER BY balance DESC
    LIMIT 10
  `;
  
  return await runSafeSql(sampleQuery, {
    maxRows: 10,
    timeout: 15000
  });
}

/**
 * Close the database connection when the application shuts down
 * Note: This is now handled by the server-side API
 */
export async function closeDatabaseConnection(): Promise<void> {
  console.log('Database connection is managed by the server-side API');
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<SqlResult> {
  return await runSafeSql('SELECT 1 as test', { timeout: 5000 });
}