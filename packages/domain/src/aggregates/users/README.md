# Users Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### User (Root)
- **Children:** none (Membership is a separate aggregate)
- **Invariants:** unique lowercased email, no hard-delete with active memberships
- **Repository:** UserRepository
- **Transaction boundary:** User row

### Membership (Root)
- **Children:** none
- **Invariants:** one User + one Org + one Role per membership, no duplicate org+scope, sole-owner check via policy
- **Repository:** MembershipRepository
- **Transaction boundary:** Membership row

See `docs/aggregates.md` §4–5 for full details.
