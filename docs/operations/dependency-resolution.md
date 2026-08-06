# Dependency Resolution

## Better Auth / Next.js Peer Dependency Issue

### Problem

Better Auth 1.6.26 declares `drizzle-kit@>=0.31.4` as a peer-optional dependency. The project uses `drizzle-kit@1.0.0-beta.22`, which satisfies the semver range but npm's strict peer dependency resolution rejects it because the beta version tag doesn't match npm's interpretation of `>=0.31.4`.

Additionally, `@better-auth/drizzle-adapter@1.6.26` declares `drizzle-orm@^0.45.2` as peer-optional, while the project uses `drizzle-orm@1.0.0-beta.22`. The beta version satisfies the range semantically but npm rejects it.

Finally, `netlify-cli@26.2.0` depends on `@netlify/build@^35.15.0` which requires `@opentelemetry/api@~1.8.0`, while Better Auth requires `@opentelemetry/api@^1.9.0`.

### Resolution

The project uses `.npmrc` with `legacy-peer-deps=true` to accept the version overrides. This is safe because:

1. `drizzle-kit` is a dev-only tool used for migration generation. Better Auth's peer-optional declaration means it works without it at runtime.
2. `drizzle-orm@1.0.0-beta.22` is API-compatible with the `^0.45.2` range for the features Better Auth uses (basic CRUD operations via the Drizzle adapter).
3. The `@opentelemetry/api` conflict is between `~1.8.0` (netlify-cli) and `^1.9.0` (better-auth). Since `1.9.1` satisfies `^1.9.0` and `1.8.0` satisfies `~1.8.0`, npm installs `1.9.1` which works with Better Auth. The netlify-cli's `@netlify/build` package works with `1.9.1` despite declaring `~1.8.0` because the API is backward-compatible.

### Verification

- `npm run build` passes — all 6 workspaces compile
- `npm run lint` passes — 0 errors
- `npm run test:unit` passes — 98 tests pass
- `npm run test:integration` passes when `TEST_DATABASE_URL` is set

### Alternative Considered

Pinning `drizzle-orm` and `drizzle-kit` to non-beta versions was considered but rejected because:
- The beta versions are required by the existing project setup
- Downgrading would break the existing migration workflow
- The `legacy-peer-deps` flag is the standard approach for projects with bleeding-edge dependencies

## Netlify CLI ajv Dependency Error

### Problem

`netlify-cli@26.2.0` has a transitive dependency on `ajv` that conflicts with `@netlify/build`'s expected version. Running `npx netlify database status` may produce an ajv-related error.

### Resolution

This is a known issue with `netlify-cli@26.x` and does not affect the application runtime. The `netlify database` commands are used only for local development and migration management. The application itself uses `@netlify/database` (the runtime package), not `netlify-cli`.

If the `ajv` error blocks local development, the workaround is:

```bash
npm install ajv@8 --save-dev --legacy-peer-deps
```

This pins `ajv` to a compatible version. The error does not affect production deployments.
