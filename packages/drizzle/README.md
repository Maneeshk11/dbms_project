# @workspace/drizzle

Drizzle ORM configuration and database schemas for the Netflix Web Series Management System.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set environment variables:

```env
DATABASE_URL=your_postgresql_connection_string
```

## Database Schemas

### Auth Schema

Located in `src/auth/schema.ts` - Contains Better Auth tables:

- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens
- `organization` - Organizations (for multi-tenant)
- `member` - Organization members
- `invitation` - Organization invitations

## Usage

### Import database instance

```ts
import { db } from "@workspace/drizzle";
```

### Import schemas

```ts
import * as schema from "@workspace/drizzle";
// or
import { user, session } from "@workspace/drizzle";
```

## Drizzle Kit Commands

- `pnpm generate` - Generate migration files
- `pnpm migrate` - Run migrations
- `pnpm push` - Push schema changes directly to database
- `pnpm studio` - Open Drizzle Studio (database GUI)

## Adding New Schemas

1. Create a new schema file in `src/` directory
2. Export it from `src/index.ts`
3. Run `pnpm generate` to create migrations
4. Run `pnpm migrate` to apply migrations
