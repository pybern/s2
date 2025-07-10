import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

export interface SqlResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
  executionTime?: number;
}

export interface SafeSqlOptions {
  timeout?: number;
  maxRows?: number;
  allowedStatements?: string[];
}

const DEFAULT_OPTIONS: SafeSqlOptions = {
  timeout: 30000,
  maxRows: 1000,
  allowedStatements: ['SELECT', 'WITH']
};

// Initialize postgres connection
const sql = postgres(process.env.POSTGRES_URL || '', {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

function validateSqlQuery(query: string, options: SafeSqlOptions): { valid: boolean; error?: string } {
  const trimmedQuery = query.trim().toUpperCase();
  
  if (!trimmedQuery) {
    return {
      valid: false,
      error: 'Query cannot be empty'
    };
  }
  
  const allowedStatements = options.allowedStatements || DEFAULT_OPTIONS.allowedStatements!;
  const isAllowed = allowedStatements.some(statement => 
    trimmedQuery.startsWith(statement.toUpperCase())
  );
  
  if (!isAllowed) {
    return {
      valid: false,
      error: `Only ${allowedStatements.join(', ')} statements are allowed`
    };
  }
  
  const dangerousKeywords = [
    'DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE',
    'TRUNCATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE',
    'COPY', 'IMPORT', 'EXPORT', '--', ';--', '/*', '*/'
  ];
  
  const hasDangerousKeyword = dangerousKeywords.some(keyword =>
    trimmedQuery.includes(keyword)
  );
  
  if (hasDangerousKeyword) {
    return {
      valid: false,
      error: 'Query contains potentially dangerous operations'
    };
  }
  
  const statements = query.split(';').filter(s => s.trim());
  if (statements.length > 1) {
    return {
      valid: false,
      error: 'Multiple statements are not allowed'
    };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const { query, options = {} } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();

    // Validate the query
    const validation = validateSqlQuery(query, mergedOptions);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error,
        executionTime: Date.now() - startTime
      })
    }

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query execution timed out after ${mergedOptions.timeout}ms`));
      }, mergedOptions.timeout);
    });

    // Execute the query with timeout
    const queryPromise = sql.unsafe(query);
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    const executionTime = Date.now() - startTime;
    
    // Limit the number of rows returned
    const limitedData = mergedOptions.maxRows && result.length > mergedOptions.maxRows
      ? result.slice(0, mergedOptions.maxRows)
      : result;

    return NextResponse.json({
      success: true,
      data: limitedData,
      rowCount: result.length,
      executionTime
    })

  } catch (error) {
    const executionTime = Date.now() - Date.now();
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      executionTime
    })
  }
}
