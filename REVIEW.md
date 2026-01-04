# Code Review: Assets Application

**Generated:** 2026-01-04
**Reviewer:** Claude Code
**Scope:** Full-stack TypeScript codebase (224 files)

---

## Executive Summary

The **Assets** application is a well-structured, production-ready TypeScript full-stack portfolio management system. The codebase demonstrates strong architectural patterns with functional programming principles and type safety. However, several security and quality improvements are recommended before production deployment.

### Quick Stats
- **Total Issues Found:** 14
- **Security Issues:** 2 high-severity
- **Code Quality Issues:** 7 medium-severity
- **Testing Gaps:** 3 medium-severity
- **Estimated Fix Time:** ~4 hours

---

## Strengths ✓

1. **Excellent Type Safety**
   - Comprehensive TypeScript coverage across 224 files
   - Runtime validation with io-ts provides safety at boundaries
   - No implicit `any` types in most code

2. **Clean Architecture**
   - Clear separation of concerns (handlers, repositories, services)
   - Monorepo structure with shared core library
   - Functional programming patterns with fp-ts and TaskEither

3. **Production-Ready Infrastructure**
   - Multi-stage Docker builds with optimization
   - Database migrations with golang-migrate
   - SQLite persistence with proper schema

4. **Authentication & Authorization**
   - JWT-based authentication
   - Password hashing with bcrypt
   - User role management (admin flag)

5. **Testing**
   - 13 test suites covering core functionality
   - Good coverage of happy paths
   - Integration tests for endpoints

---

## Issues & Recommendations

### 1. 🔴 SECURITY: Bearer Token Parsing Vulnerability

**Severity:** HIGH
**File:** `packages/backend/src/services/auth.ts:77`
**Category:** Authentication

#### Problem
```typescript
TE.of(authorizationHeader.replace("Bearer ", ""))
```

The naive string replacement is vulnerable to malformed headers:
- `"XBearer token123"` would incorrectly parse to `"token123"`
- `"Bearer"` (no space) would return entire string
- Not RFC 7235 compliant

#### Impact
Potential auth bypass or token injection if client sends specially crafted headers.

#### Recommended Fix
```typescript
TE.bind("token", () =>
  authorizationHeader
    ? authorizationHeader.startsWith("Bearer ")
      ? TE.of(authorizationHeader.slice(7)) // "Bearer ".length === 7
      : TE.left(authError("invalid authorization header format"))
    : TE.left(authError("no token provided"))
)
```

#### Testing
```typescript
// Should pass
verifyBearer("Bearer validtoken123")

// Should fail
verifyBearer("XBearer validtoken123")
verifyBearer("Bearer")
verifyBearer("validtoken123")
```

---

### 2. 🔴 SECURITY: CORS Configuration Too Permissive

**Severity:** HIGH
**File:** `packages/backend/src/index.ts:68`
**Category:** Network Security

#### Problem
```typescript
exp.use(cors());
```

Default CORS configuration allows ALL origins. For a personal finance application, this enables:
- Cross-site request forgery (CSRF) attacks
- Data exfiltration from any malicious website
- Credential theft if cookies are used

#### Impact
High-risk vulnerability for production deployment with user financial data.

#### Recommended Fix (Updated)

The CORS origin should be **read from environment variables**, not hardcoded. Different environments need different configurations:

**1. Add to Config type** (`packages/backend/src/index.ts`)
```typescript
type Config = {
  database: string;
  app: string;
  port: number;
  cacheSize: number;
  cacheTtl: number;
  corsOrigin: string;  // ← Add this
};

const config = (): Action<Config> =>
  pipe(
    TE.Do,
    TE.apS("database", env("ASSETS_DB")),
    TE.apS("app", env("ASSETS_APP")),
    TE.apS("port", envNumber("ASSETS_PORT")),
    TE.apS("cacheSize", envNumber("ASSETS_CACHE_SIZE", 1000)),
    TE.apS("cacheTtl", envDurationMsec("ASSETS_CACHE_TTL", "1m")),
    TE.apS("corsOrigin", pipe(
      env("CORS_ORIGIN", null),
      TE.chain(validateCorsOrigin)  // Validate below
    ))
  );
```

**2. Add validation function** (in `packages/backend/src/services/env.ts`)
```typescript
// Validates CORS origin with environment-aware defaults
export const validateCorsOrigin = (origin: string | null): Action<string> =>
  pipe(
    TE.Do,
    TE.bind("nodeEnv", () => TE.of(process.env.NODE_ENV || "development")),
    TE.chain(({ nodeEnv }) => {
      // Development: allow localhost:5173 as fallback
      if (nodeEnv === "development") {
        return TE.of(origin || "http://localhost:5173");
      }

      // Production: REQUIRE explicit origin (don't assume)
      if (!origin) {
        return TE.left(
          new Error(
            "CORS_ORIGIN environment variable is required in production. " +
            "Set it to your frontend domain (e.g., https://yourdomain.com)"
          )
        );
      }

      // Validate origin uses HTTPS in production (security requirement)
      if (!origin.startsWith("https://") && !origin.includes("localhost")) {
        return TE.left(
          new Error(
            "CORS_ORIGIN must use HTTPS in production for security. " +
            `Got: ${origin}`
          )
        );
      }

      return TE.of(origin);
    })
  );
```

**3. Use in CORS middleware** (`packages/backend/src/index.ts`)
```typescript
const server = ({ port, app, corsOrigin }: Config, ctx: Context): Action<Server> => {
  const expressify = createRequestHandler(ctx);
  const handlers = createHandlers(expressify);

  return pipe(
    TE.of(express()),
    TE.tapIO((exp) => () => {
      // CORS with configured origin from environment
      exp.use(cors({
        origin: corsOrigin,  // ← Read from config, not hardcoded
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400 // 24 hours
      }));

      exp.use(express.json());
    }),
    // ... rest of setup
  );
};
```

**4. Environment Files**

**`.env.development`** (or local development)
```
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ASSETS_DB=./data/assets.db
ASSETS_APP=./public
ASSETS_PORT=4020
ASSETS_JWT_SECRET=dev-secret-change-in-production
```

**`.env.production`** (or production deployment)
```
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
ASSETS_DB=./data/assets.db
ASSETS_APP=./public
ASSETS_PORT=4020
ASSETS_JWT_SECRET=<generate-strong-random-secret>
```

**`docker-compose.yaml`**
```yaml
services:
  assets:
    environment:
      NODE_ENV: production
      CORS_ORIGIN: ${CORS_ORIGIN:-https://yourdomain.com}  # Must be set
      ASSETS_DB: ./data/assets.db
      ASSETS_APP: ./public
      ASSETS_PORT: 4020
      ASSETS_JWT_SECRET: ${ASSETS_JWT_SECRET}
```

#### Why This Approach is Better

| Aspect | Old Approach | Corrected Approach |
|--------|-------------|-------------------|
| **Config source** | Hardcoded in code | Environment variables |
| **Development default** | Always localhost:5173 | Smart: only if NODE_ENV=dev |
| **Production behavior** | Still accepts fallback default | Requires explicit configuration |
| **HTTPS validation** | None | Enforced in production |
| **Fail-fast** | Silent failures possible | Clear error messages |
| **Security** | ⚠️ Relies on defaults | ✅ Explicit in each environment |

#### Key Points

- ✅ **Development:** Falls back to `localhost:5173` automatically (Vite dev server)
- ✅ **Production:** Requires explicit `CORS_ORIGIN` env var, fails if missing
- ✅ **HTTPS validation:** Ensures production uses HTTPS for security
- ✅ **No hardcoding:** Port/origin comes from configuration, not code

---

### 3. 🟡 SECURITY: Generic Error Messages

**Severity:** MEDIUM
**File:** `packages/backend/src/handlers/auth.ts:50, 54`
**Category:** Information Disclosure

#### Problem
```typescript
TE.filterOrElse(
  ({ profile }) => !!profile && !profile.locked,
  () => authError("User restricted")  // Reveals account locked
)
```

Reveals whether:
- User account exists
- User account is locked
- Authentication failed

#### Impact
Enables user enumeration and account status discovery attacks.

#### Recommended Fix
Use consistent, generic responses:
```typescript
TE.filterOrElse(
  ({ profile }) => !!profile && !profile.locked,
  () => authError("Invalid credentials") // Generic message
)
```

And in `auth.ts:50`:
```typescript
TE.filterOrElse(
  identity,
  () => authError("Invalid credentials") // Don't say "wrong password"
)
```

---

### 4. 🟡 DATABASE: SQL Injection Prevention Verification

**Severity:** MEDIUM
**File:** `packages/backend/src/repository/**`
**Category:** Data Security

#### Problem
Cannot fully verify SQL safety without detailed inspection of all SQL builders in `repository/sql/`.

#### Recommendation
Audit SQL queries to ensure:
- All dynamic values use parameterized queries (`?` placeholders)
- No string concatenation in SQL
- No unvalidated user input in WHERE clauses

#### Verification Script
```bash
# Check for string concatenation patterns
grep -r "\.sql\|SELECT\|INSERT\|UPDATE\|DELETE" \
  packages/backend/src/repository/sql/ | \
  grep -E "\$|\+|`|template" | \
  grep -v "?"
```

Expected output: None

---

### 5. 🟡 CACHING: LRU Cache Effectiveness Unknown

**Severity:** MEDIUM
**File:** `packages/backend/src/index.ts:50-59`
**Category:** Performance & Monitoring

#### Problem
```typescript
new LRUCache<Stringifiable, any>({
  max: cacheSize,
  ttl: cacheTtl,
})
```

No visibility into:
- Cache hit/miss rates
- Whether TTL is appropriate for market data (data staleness)
- Cache eviction patterns

#### Impact
- Hard to debug performance issues
- Difficult to optimize cache configuration
- No alerts for cache thrashing

#### Recommended Fix
Create a cache wrapper with metrics:

```typescript
// services/cache.ts
export type CacheMetrics = {
  hits: number;
  misses: number;
  evictions: number;
  getHitRate: () => string; // "75.5%"
  reset: () => void;
};

export const createCache = (
  lru: LRUCache<Stringifiable, any>
): { cache: AppCache; metrics: CacheMetrics } => {
  let metrics = { hits: 0, misses: 0, evictions: 0 };

  return {
    cache: {
      get: (key) => {
        const value = lru.get(key);
        if (value) metrics.hits++;
        else metrics.misses++;
        return value;
      },
      set: (key, value) => lru.set(key, value),
    },
    metrics: {
      ...metrics,
      getHitRate: () => {
        const total = metrics.hits + metrics.misses;
        return total === 0 ? "N/A" : ((metrics.hits / total) * 100).toFixed(1) + "%";
      },
      reset: () => (metrics = { hits: 0, misses: 0, evictions: 0 }),
    }
  };
};
```

Add endpoint for monitoring:
```typescript
// In handlers
app.get("/api/v1/admin/cache-metrics", (req, res) => {
  res.json(cacheMetrics);
});
```

#### Market Data Staleness
Document acceptable staleness:
```markdown
# Cache Configuration

- **Yahoo Finance Data:** 5-15 minute TTL (matches market update frequency)
- **User Data:** 30 second TTL (account changes)
- **Portfolio Summary:** 1 minute TTL (calculated data)
```

---

### 6. 🟡 DOCKERFILE: Missing Security Hardening

**Severity:** MEDIUM
**File:** `Dockerfile`
**Category:** Container Security

#### Problems

1. **No non-root user**
   ```dockerfile
   # Current: runs as root
   ```

2. **Missing health check**
   - Container orchestration can't detect hung processes

3. **Package manager cache not cleaned**
   ```dockerfile
   RUN apt install -y ca-certificates
   # Leaves cache files, increases image size
   ```

4. **No resource limits in compose**
   - Container could consume all system resources

#### Recommended Fixes

**Dockerfile:**
```dockerfile
FROM golang:1.24 AS migrate
RUN go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun run check
RUN bun run build

FROM debian:bookworm-slim AS runner
# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -u 1000 appuser

WORKDIR /app

COPY --from=migrate /go/bin/migrate /usr/sbin/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist/public /app/public
COPY --from=builder /app/dist/backend /app/backend
COPY --from=builder /app/.migrations /app/.migrations

# Clean install, reduce layer size
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/apt/*

# Ensure correct permissions
RUN chown -R appuser:appuser /app

ENV ASSETS_APP="./public"
ENV ASSETS_PORT=4020

# Run as non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4020/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["sh", "-c", "migrate -verbose -path .migrations -database=sqlite3://$ASSETS_DB up && node ./backend"]
```

**Note:** Add health check endpoint if missing:
```typescript
// In packages/backend/src/index.ts handlers
app.get("/api/v1/health", (_, res) => res.json({ status: "ok" }));
```

**docker-compose.yaml:**
```yaml
services:
  app:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:4020/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
```

---

### 7. 🟡 LOGGING: Using console.log in Production

**Severity:** MEDIUM
**File:** `packages/backend/src/index.ts:144` (and throughout)
**Category:** Observability

#### Problem
```typescript
console.log(`Listening on ${port}`)
```

Issues:
- Not structured (can't parse programmatically)
- No log levels (info, warn, error)
- No timestamps
- Hard to correlate logs across services
- No log aggregation support

#### Impact
Difficult debugging in production, no monitoring/alerting capability.

#### Recommended Fix

Create a logging service:
```typescript
// packages/backend/src/services/logger.ts
import { pipe } from "fp-ts/lib/function";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL = (process.env.LOG_LEVEL || "info") as LogLevel;
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export const logger = {
  debug: (msg: string, meta?: Record<string, any>) => {
    if (LOG_LEVELS["debug"] >= LOG_LEVELS[LOG_LEVEL]) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "DEBUG",
        message: msg,
        ...meta,
      }));
    }
  },

  info: (msg: string, meta?: Record<string, any>) => {
    if (LOG_LEVELS["info"] >= LOG_LEVELS[LOG_LEVEL]) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: msg,
        ...meta,
      }));
    }
  },

  warn: (msg: string, meta?: Record<string, any>) => {
    if (LOG_LEVELS["warn"] >= LOG_LEVELS[LOG_LEVEL]) {
      console.warn(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "WARN",
        message: msg,
        ...meta,
      }));
    }
  },

  error: (msg: string, error?: Error, meta?: Record<string, any>) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message: msg,
      error: error?.message,
      stack: error?.stack,
      ...meta,
    }));
  },
};
```

Usage:
```typescript
import { logger } from "./services/logger";

logger.info("Server starting", { port });
logger.error("Database connection failed", dbError, { retries: 3 });
```

---

### 8. 🟡 TYPE SAFETY: Implicit Any in LRU Cache

**Severity:** MEDIUM
**File:** `packages/backend/src/index.ts:54`
**Category:** Type Safety

#### Problem
```typescript
new LRUCache<Stringifiable, any>({  // <-- any defeats type checking
```

The `any` type allows unsafely storing any value, leading to:
- Type errors at runtime
- No IDE autocomplete for cached values
- Unsafe type coercion

#### Recommended Fix
```typescript
// Define cache value types
type CacheValue =
  | { type: "asset"; data: Asset }
  | { type: "ticker"; data: TickerInfo }
  | { type: "portfolio"; data: Portfolio };

new LRUCache<Stringifiable, CacheValue>({
  max: cacheSize,
  ttl: cacheTtl,
})
```

Or use a union of all cacheable types from assets-core.

---

### 9. 🟡 API: Missing Input Validation on CSV Upload

**Severity:** MEDIUM
**File:** `packages/backend/src/handlers/transaction.ts` (inferred)
**Category:** Input Validation

#### Problem
CSV transaction uploads likely lack:
- File size limits (could cause OOM)
- Row count limits (could hang parser)
- Duplicate detection (silent overwrites)
- Invalid data handling (malformed dates, amounts)

#### Impact
- DoS vulnerability via large file upload
- Memory exhaustion
- Data corruption

#### Recommended Fix

```typescript
// packages/backend/src/decoders/csv.ts
import { left, right } from "fp-ts/Either";
import * as A from "fp-ts/Array";

const CSV_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const CSV_ROW_LIMIT = 10000;
const CSV_COLUMN_LIMIT = 20;

export const validateCsvFile = (file: { size: number; name: string }) =>
  file.size > CSV_SIZE_LIMIT
    ? left(validationError(`CSV file exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`))
    : file.name.endsWith(".csv")
    ? right(file)
    : left(validationError("File must be .csv format"));

export const validateCsvRows = (rows: string[][]) =>
  rows.length > CSV_ROW_LIMIT
    ? left(validationError(`CSV exceeds ${CSV_ROW_LIMIT} rows (has ${rows.length})`))
    : rows.some(row => row.length > CSV_COLUMN_LIMIT)
    ? left(validationError(`CSV exceeds ${CSV_COLUMN_LIMIT} columns`))
    : right(rows);

// Usage in handler:
TE.bind("validated", ({ file }) => validateCsvFile(file))
```

---

### 10. 🟡 STATIC FILES: Missing Cache Headers

**Severity:** MEDIUM
**File:** `packages/backend/src/index.ts:74-76`
**Category:** Performance

#### Problem
```typescript
exp.use("/app", express.static(path.join(process.cwd(), app)));
```

Without cache headers:
- Browsers download same assets on every page load
- Increases bandwidth usage
- Slower perceived performance

#### Recommended Fix
```typescript
exp.use("/app", express.static(
  path.join(process.cwd(), app),
  {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : "1s",
    etag: false,          // Reduce response size
    lastModified: false,  // Rely on maxAge
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    }
  }
));
```

This ensures:
- HTML files are never cached (always fetch latest)
- JS/CSS bundles (with hash in filename) are cached for 1 day
- Reduces bandwidth after first load

---

### 11. 🟡 TESTING: Low Coverage of Critical Paths

**Severity:** MEDIUM
**File:** `packages/backend/test/`
**Category:** Testing

#### Current Coverage
- ✅ Authentication (login, token refresh)
- ✅ Portfolio CRUD operations
- ✅ Asset management
- ✅ Transaction basic operations
- ❌ CSV import edge cases
- ❌ Account locking/unlocking
- ❌ Portfolio performance calculations
- ❌ Cache expiration behavior
- ❌ Error handling and edge cases

#### Recommended Missing Tests

**1. CSV Import Edge Cases** (`packages/backend/test/csv-import.spec.ts`)
```typescript
describe("CSV Transaction Import", () => {
  test("should reject files over 5MB", () => {
    // Test file size validation
  });

  test("should handle malformed CSV", () => {
    // Test invalid format handling
  });

  test("should reject duplicate transactions", () => {
    // Test duplicate detection
  });

  test("should validate all required columns", () => {
    // Test column validation
  });

  test("should handle invalid dates", () => {
    // Test date parsing
  });

  test("should convert amounts correctly", () => {
    // Test number parsing with locales
  });
});
```

**2. Security Tests** (`packages/backend/test/security.spec.ts`)
```typescript
describe("Security", () => {
  test("should reject malformed Authorization header", () => {
    // Test Bearer token parsing
  });

  test("should not expose user existence on login", () => {
    // Test information disclosure
  });

  test("should lock account after failed attempts", () => {
    // Test brute force protection
  });

  test("should enforce CORS restrictions", () => {
    // Test CORS headers
  });

  test("should validate JWT expiration", () => {
    // Test token validation
  });
});
```

**3. Portfolio Performance** (`packages/backend/test/portfolio-performance.spec.ts`)
```typescript
describe("Portfolio Performance Calculations", () => {
  test("should calculate correct returns with dividends", () => {});
  test("should handle multiple currencies", () => {});
  test("should handle empty portfolios", () => {});
  test("should calculate weighted performance", () => {});
});
```

#### Current Test Command
```bash
bun test
```

#### Recommended: Add Test Coverage Report
```json
{
  "scripts": {
    "test": "bun test",
    "test:coverage": "bun test --coverage"
  }
}
```

---

### 12. 🟡 ERROR HANDLING: Inconsistent Error Messages

**Severity:** MEDIUM
**File:** `packages/backend/src/handlers/` (multiple files)
**Category:** API Consistency

#### Problem
Error messages vary in format and detail level:
- Some: `"Wrong password?"` (too specific)
- Some: `"User restricted"` (context-dependent)
- Some: Generic validation errors (good)

#### Impact
- API clients can't reliably parse errors
- Inconsistent user experience
- Information leakage

#### Recommendation
Standardize error response format:

```typescript
// packages/backend/src/domain/error.ts
export type ErrorResponse = {
  error: {
    code: string;           // "INVALID_CREDENTIALS", "VALIDATION_ERROR"
    message: string;        // User-facing message
    details?: Record<string, any>; // Only for validation errors
  };
};

// Usage in handlers
mapWebError(error) {
  if (error.code === "AUTH_ERROR") {
    return {
      statusCode: 401,
      body: { error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials provided" } }
    };
  }
  // ...
}
```

---

### 13. 🟡 DATABASE MIGRATIONS: No Documented Rollback

**Severity:** MEDIUM
**File:** `.migrations/` & `Dockerfile`
**Category:** Operations

#### Problem
The Dockerfile automatically runs migrations:
```dockerfile
CMD ["sh", "-c", "migrate -verbose -path .migrations -database=sqlite3://$ASSETS_DB up && ./backend"]
```

But no documented procedure for:
- Rolling back migrations in emergency
- Backup before migration
- Data migration validation

#### Recommendation

**Add to README.md:**
```markdown
## Database Operations

### Backup Database
```bash
cp data/assets.db data/assets.db.backup
```

### Run Migrations
Migrations run automatically on startup.

### Rollback Migration (Emergency)
```bash
# Stop container
docker-compose down

# Rollback last migration
migrate -verbose \
  -path .migrations \
  -database "sqlite3:///data/assets.db" \
  down 1

# Start container
docker-compose up
```

### Check Migration Status
```bash
migrate -path .migrations \
  -database "sqlite3:///data/assets.db" \
  version
```
```

Also add migration validation test:
```typescript
// packages/backend/test/migrations.spec.ts
describe("Database Migrations", () => {
  test("should run all migrations successfully", async () => {
    // Test migration execution
  });

  test("should create expected schema", async () => {
    // Verify tables, indexes, constraints
  });

  test("should be idempotent", async () => {
    // Running migrations twice shouldn't fail
  });
});
```

---

### 14. 🟡 CONFIGURATION: Missing Environment Variable Validation

**Severity:** MEDIUM
**File:** `packages/backend/src/services/env.ts` (inferred)
**Category:** Configuration Management

#### Problem
If required environment variables are missing, app crashes at runtime with unclear errors.

#### Recommended Fix

Create comprehensive env validation:

```typescript
// packages/backend/src/services/env-validation.ts
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";

const REQUIRED_ENVS = [
  "ASSETS_DB",
  "ASSETS_APP",
  "ASSETS_JWT_SECRET",
];

const OPTIONAL_ENVS = [
  { name: "ASSETS_PORT", default: "4020" },
  { name: "ASSETS_CACHE_SIZE", default: "1000" },
  { name: "ASSETS_CACHE_TTL", default: "5m" },
  { name: "CORS_ORIGIN", default: "http://localhost:5173" },
  { name: "LOG_LEVEL", default: "info" },
];

export const validateEnv = (): TE.TaskEither<Error, void> => {
  const missing = REQUIRED_ENVS.filter(e => !process.env[e]);

  if (missing.length > 0) {
    return TE.left(
      new Error(`Missing required environment variables:\n  - ${missing.join("\n  - ")}`)
    );
  }

  return TE.right(undefined);
};
```

Usage at app startup:
```typescript
// In packages/backend/src/index.ts
const app = () =>
  pipe(
    validateEnv(),
    TE.chain(() => config()),
    // ... rest of setup
  );
```

Add to docker-compose.yaml for documentation:
```yaml
services:
  app:
    environment:
      ASSETS_DB: ./data/assets.db
      ASSETS_APP: ./public
      ASSETS_JWT_SECRET: ${ASSETS_JWT_SECRET}  # Must be set
      ASSETS_PORT: 4020
      ASSETS_CACHE_SIZE: 1000
      ASSETS_CACHE_TTL: 5m
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:5173}
      LOG_LEVEL: ${LOG_LEVEL:-info}
```

---

## Implementation Priority

### Phase 1: Security (Do First)
- [ ] Fix Bearer token parsing (Issue #1)
- [ ] Restrict CORS origin (Issue #2)
- [ ] Generic error messages (Issue #3)
- [ ] Verify SQL injection protection (Issue #4)

**Estimated time:** 30 minutes

### Phase 2: Infrastructure (Before Production)
- [ ] Harden Dockerfile (Issue #6)
- [ ] Add structured logging (Issue #7)
- [ ] Add health check endpoint (Issue #6)
- [ ] Add environment validation (Issue #14)

**Estimated time:** 1.5 hours

### Phase 3: Quality (Recommended)
- [ ] Add cache metrics (Issue #5)
- [ ] Fix type safety (Issue #8)
- [ ] Add CSV validation (Issue #9)
- [ ] Add cache headers (Issue #10)
- [ ] Add missing tests (Issue #11)
- [ ] Standardize error messages (Issue #12)
- [ ] Document database operations (Issue #13)

**Estimated time:** 2 hours

---

## Testing Checklist Before Production

- [ ] All tests pass: `bun test`
- [ ] Type checking passes: `bun run check`
- [ ] Build succeeds: `bun run build`
- [ ] Security issues (#1-4) are resolved
- [ ] Docker image builds and runs
- [ ] CORS is restricted to your domain
- [ ] Environment variables are documented
- [ ] Database backups work
- [ ] Health check endpoint responds
- [ ] Logs are structured and parseable
- [ ] Rate limiting is configured (if needed)
- [ ] HTTPS is enforced (in production)

---

## Additional Recommendations

### 1. Add Rate Limiting
Protect against brute force attacks:
```typescript
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                     // 5 attempts
  message: "Too many login attempts, try again later"
});

app.post("/login", loginLimiter, handlers.auth.login);
```

### 2. Add HTTPS Support
```typescript
// For development: self-signed cert
// For production: use reverse proxy (nginx) with Let's Encrypt
```

### 3. Add API Documentation
```bash
# Generate OpenAPI/Swagger docs from handlers
bun add -d swagger-jsdoc swagger-ui-express
```

### 4. Add Request ID Tracing
Track requests across logs:
```typescript
import { v4 as uuid } from "uuid";

app.use((req, res, next) => {
  req.id = uuid();
  res.setHeader("X-Request-ID", req.id);
  next();
});
```

### 5. Monitor External API Calls
Track Yahoo Finance API performance:
```typescript
app.get("/api/v1/admin/stats", (req, res) => {
  res.json({
    cache: cacheMetrics,
    api: yahooApiMetrics,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

---

## Files Modified Summary

| File | Changes | Complexity |
|------|---------|-----------|
| `packages/backend/src/services/auth.ts` | Fix Bearer token parsing | Low |
| `packages/backend/src/index.ts` | Add CORS config, health check | Low |
| `Dockerfile` | Add user, cache cleanup, health check | Medium |
| `packages/backend/src/services/logger.ts` | Create logging service | Low |
| `packages/backend/src/services/cache.ts` | Add cache metrics | Low |
| `packages/backend/test/csv-import.spec.ts` | New test file | Medium |
| `packages/backend/test/security.spec.ts` | New test file | Medium |
| `.env.example` | Document required vars | Low |
| `docker-compose.yaml` | Add resource limits, health checks | Low |
| `README.md` | Add deployment docs | Low |

---

## Questions for Discussion

1. **CORS Origin:** What domains should be allowed? (localhost for dev, specific domain for production)
2. **Cache TTL:** Is 5 minutes appropriate for Yahoo Finance data? Should it be configurable?
3. **Log Level:** What log level for production? (info, warn, or error only?)
4. **Rate Limiting:** Should login attempts be rate-limited?
5. **User Tracking:** Do you need request IDs for debugging?

---

## Conclusion

The codebase demonstrates strong fundamentals and architectural patterns. Addressing the security issues (#1-4) is critical before production. The remaining issues improve code quality, maintainability, and operational visibility.

Estimated total time to implement all recommendations: **4 hours**

Would you like guidance on implementing any specific issue?

