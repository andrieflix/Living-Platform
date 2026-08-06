# Create Organization

Creates a new Organization aggregate — the top-level tenant entity.

## Usage

```typescript
import { composeTest } from "@livingsites/composition";

const comp = composeTest();
const result = await comp.createOrganization(
  { name: "Tajon Construction", slug: "tajon-construction", billingEmail: "billing@tajon.com" },
  comp.createOrganizationDeps,
);
```

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | yes | Display name, 1-200 chars |
| slug | string | yes | URL slug, lowercase alphanumeric with dashes, 2-63 chars |
| billingEmail | string | yes | Valid email address |
| planId | PlanId | no | Reference to an active Plan |

## Errors

| Code | When |
|---|---|
| input_validation | Name, slug, or email fails validation |
| duplicate_slug | An organization with the slug already exists |
| plan_not_available | The referenced plan was not found |
| policy_denial | A policy denied the request (reserved slug, inactive plan) |
| persistence_unavailable | Database connection failed |
| invalid_persistence_state | Unexpected persistence state |

## Event

Emits `organization.created` exactly once after successful persistence. No
event on any failure path.
