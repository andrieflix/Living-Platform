/**
 * Compile-time contract checks for aggregate concurrency and layer boundaries.
 *
 * This file is a type-only fixture. It is compiled but never executed.
 * If any check fails to compile, a contract is broken:
 * - a mutable aggregate root is missing `version: AggregateVersion`;
 * - a child entity was given an independent version;
 * - PageSnapshot has an AggregateVersion or a generic `version` field;
 * - RepositoryError/SaveResult are exported by Domain instead of Application;
 * - a repository has a combined create/save instead of distinct operations;
 * - create requires expectedVersion;
 * - save does not require expectedVersion;
 * - save does not require an aggregate with an ID.
 */
import type {
  Organization,
  Plan,
  Feature,
  User,
  Membership,
  Role,
  Website,
  WebsiteSettings,
  Navigation,
  MenuItem,
  Theme,
  Page,
  PageSnapshot,
  Section,
  SectionType,
  Media,
  Folder,
  Form,
  FormField,
  Submission,
  SEOProfile,
  SchemaProfile,
  AnalyticsProfile,
  ExportJob,
  Plugin,
  PluginInstallation,
  AggregateVersion,
  ConcurrencyConflict,
} from "@livingsites/domain";

import type {
  OrganizationRepository,
  PlanRepository,
  FeatureRepository,
  UserRepository,
  MembershipRepository,
  RoleRepository,
  WebsiteRepository,
  NavigationRepository,
  ThemeRepository,
  PageRepository,
  PageSnapshotRepository,
  SectionTypeRepository,
  MediaRepository,
  FolderRepository,
  FormRepository,
  SubmissionRepository,
  SEOProfileRepository,
  SchemaProfileRepository,
  AnalyticsProfileRepository,
  ExportJobRepository,
  RepositoryError,
  CreateResult,
  SaveResult,
  CreateError,
  SaveError,
  DuplicateKeyError,
  PersistenceUnavailableError,
  InvalidPersistenceStateError,
} from "@livingsites/application";

/* ---------- Type helpers ---------- */

type HasVersion<T> = T extends { version: AggregateVersion } ? true : false;

/** true iff T is never (uses tuple wrapping to avoid distribution). */
type IsNever<T> = [T] extends [never] ? true : false;

/** Extracts the Nth parameter type (0-indexed) of a function; `never` if absent. */
type NthParam<F, N extends number> = F extends (...args: infer P) => unknown
  ? P[N] extends undefined
    ? never
    : P[N]
  : never;

/** Count the parameters of a function. */
type ParamCount<F> = F extends (...args: infer P) => unknown ? P["length"] : never;

/** true iff T has a `create` method whose only param does NOT include AggregateVersion. */
type CreateHasNoExpectedVersion<T> = T extends { create: infer F }
  ? IsNever<NthParam<F, 1>> extends true
    ? true
    : NthParam<F, 1> extends AggregateVersion
      ? false
      : true
  : false;

/** true iff T has a `save` method with exactly 2 params, second being AggregateVersion. */
type SaveHasExpectedVersion<T> = T extends { save: infer F }
  ? ParamCount<F> extends 2
    ? IsNever<NthParam<F, 1>> extends true
      ? false
      : NthParam<F, 1> extends AggregateVersion
        ? true
        : false
    : false
  : false;

/** true iff T has a `save` method whose first param has an identity field (id or key). */
type SaveRequiresId<T> = T extends { save: (aggregate: infer A, ...rest: never[]) => unknown }
  ? A extends { id: unknown }
    ? true
    : A extends { key: unknown }
      ? true
      : false
  : false;

/** true iff T has a `create` method (distinct from save). */
type HasCreate<T> = T extends { create: unknown } ? true : false;

/** true iff T has a `save` method (distinct from create). */
type HasSave<T> = T extends { save: unknown } ? true : false;

/** Checks that PageSnapshot has revisionNumber and NOT version: AggregateVersion. */
type HasRevisionNumber<T> = T extends { revisionNumber: number } ? true : false;

/* ---------- Mutable roots require version: AggregateVersion ---------- */

const _orgHasVersion: HasVersion<Organization> = true;
const _planHasVersion: HasVersion<Plan> = true;
const _featureHasVersion: HasVersion<Feature> = true;
const _userHasVersion: HasVersion<User> = true;
const _membershipHasVersion: HasVersion<Membership> = true;
const _roleHasVersion: HasVersion<Role> = true;
const _websiteHasVersion: HasVersion<Website> = true;
const _navigationHasVersion: HasVersion<Navigation> = true;
const _themeHasVersion: HasVersion<Theme> = true;
const _pageHasVersion: HasVersion<Page> = true;
const _sectionTypeHasVersion: HasVersion<SectionType> = true;
const _mediaHasVersion: HasVersion<Media> = true;
const _folderHasVersion: HasVersion<Folder> = true;
const _formHasVersion: HasVersion<Form> = true;
const _submissionHasVersion: HasVersion<Submission> = true;
const _seoHasVersion: HasVersion<SEOProfile> = true;
const _schemaHasVersion: HasVersion<SchemaProfile> = true;
const _analyticsHasVersion: HasVersion<AnalyticsProfile> = true;
const _exportJobHasVersion: HasVersion<ExportJob> = true;
const _pluginHasVersion: HasVersion<Plugin> = true;
const _pluginInstallationHasVersion: HasVersion<PluginInstallation> = true;

/* ---------- Child entities do NOT have AggregateVersion ---------- */

const _sectionNoVersion: HasVersion<Section> = false;
const _formFieldNoVersion: HasVersion<FormField> = false;
const _menuItemNoVersion: HasVersion<MenuItem> = false;
const _websiteSettingsNoVersion: HasVersion<WebsiteSettings> = false;

/* ---------- PageSnapshot: no AggregateVersion, has revisionNumber ---------- */

const _snapshotNoVersion: HasVersion<PageSnapshot> = false;
const _snapshotHasRevision: HasRevisionNumber<PageSnapshot> = true;

/* ---------- Repositories have distinct create and save ---------- */

const _orgHasCreate: HasCreate<OrganizationRepository> = true;
const _orgHasSave: HasSave<OrganizationRepository> = true;
const _planHasCreate: HasCreate<PlanRepository> = true;
const _planHasSave: HasSave<PlanRepository> = true;
const _featureHasCreate: HasCreate<FeatureRepository> = true;
const _featureHasSave: HasSave<FeatureRepository> = true;
const _userHasCreate: HasCreate<UserRepository> = true;
const _userHasSave: HasSave<UserRepository> = true;
const _membershipHasCreate: HasCreate<MembershipRepository> = true;
const _membershipHasSave: HasSave<MembershipRepository> = true;
const _roleHasCreate: HasCreate<RoleRepository> = true;
const _roleHasSave: HasSave<RoleRepository> = true;
const _websiteHasCreate: HasCreate<WebsiteRepository> = true;
const _websiteHasSave: HasSave<WebsiteRepository> = true;
const _navigationHasCreate: HasCreate<NavigationRepository> = true;
const _navigationHasSave: HasSave<NavigationRepository> = true;
const _themeHasCreate: HasCreate<ThemeRepository> = true;
const _themeHasSave: HasSave<ThemeRepository> = true;
const _pageHasCreate: HasCreate<PageRepository> = true;
const _pageHasSave: HasSave<PageRepository> = true;
const _sectionTypeHasCreate: HasCreate<SectionTypeRepository> = true;
const _sectionTypeHasSave: HasSave<SectionTypeRepository> = true;
const _mediaHasCreate: HasCreate<MediaRepository> = true;
const _mediaHasSave: HasSave<MediaRepository> = true;
const _folderHasCreate: HasCreate<FolderRepository> = true;
const _folderHasSave: HasSave<FolderRepository> = true;
const _formHasCreate: HasCreate<FormRepository> = true;
const _formHasSave: HasSave<FormRepository> = true;
const _seoProfileHasCreate: HasCreate<SEOProfileRepository> = true;
const _seoProfileHasSave: HasSave<SEOProfileRepository> = true;
const _schemaProfileHasCreate: HasCreate<SchemaProfileRepository> = true;
const _schemaProfileHasSave: HasSave<SchemaProfileRepository> = true;
const _analyticsProfileHasCreate: HasCreate<AnalyticsProfileRepository> = true;
const _analyticsProfileHasSave: HasSave<AnalyticsProfileRepository> = true;
const _exportJobHasCreate: HasCreate<ExportJobRepository> = true;
const _exportJobHasSave: HasSave<ExportJobRepository> = true;

/* ---------- create does NOT require expectedVersion ---------- */

const _orgCreateNoVersion: CreateHasNoExpectedVersion<OrganizationRepository> = true;
const _planCreateNoVersion: CreateHasNoExpectedVersion<PlanRepository> = true;
const _featureCreateNoVersion: CreateHasNoExpectedVersion<FeatureRepository> = true;
const _userCreateNoVersion: CreateHasNoExpectedVersion<UserRepository> = true;
const _membershipCreateNoVersion: CreateHasNoExpectedVersion<MembershipRepository> = true;
const _roleCreateNoVersion: CreateHasNoExpectedVersion<RoleRepository> = true;
const _websiteCreateNoVersion: CreateHasNoExpectedVersion<WebsiteRepository> = true;
const _navigationCreateNoVersion: CreateHasNoExpectedVersion<NavigationRepository> = true;
const _themeCreateNoVersion: CreateHasNoExpectedVersion<ThemeRepository> = true;
const _pageCreateNoVersion: CreateHasNoExpectedVersion<PageRepository> = true;
const _sectionTypeCreateNoVersion: CreateHasNoExpectedVersion<SectionTypeRepository> = true;
const _mediaCreateNoVersion: CreateHasNoExpectedVersion<MediaRepository> = true;
const _folderCreateNoVersion: CreateHasNoExpectedVersion<FolderRepository> = true;
const _formCreateNoVersion: CreateHasNoExpectedVersion<FormRepository> = true;
const _seoProfileCreateNoVersion: CreateHasNoExpectedVersion<SEOProfileRepository> = true;
const _schemaProfileCreateNoVersion: CreateHasNoExpectedVersion<SchemaProfileRepository> = true;
const _analyticsProfileCreateNoVersion: CreateHasNoExpectedVersion<AnalyticsProfileRepository> = true;
const _exportJobCreateNoVersion: CreateHasNoExpectedVersion<ExportJobRepository> = true;

/* ---------- save requires expectedVersion ---------- */

const _orgSaveHasVersion: SaveHasExpectedVersion<OrganizationRepository> = true;
const _planSaveHasVersion: SaveHasExpectedVersion<PlanRepository> = true;
const _featureSaveHasVersion: SaveHasExpectedVersion<FeatureRepository> = true;
const _userSaveHasVersion: SaveHasExpectedVersion<UserRepository> = true;
const _membershipSaveHasVersion: SaveHasExpectedVersion<MembershipRepository> = true;
const _roleSaveHasVersion: SaveHasExpectedVersion<RoleRepository> = true;
const _websiteSaveHasVersion: SaveHasExpectedVersion<WebsiteRepository> = true;
const _navigationSaveHasVersion: SaveHasExpectedVersion<NavigationRepository> = true;
const _themeSaveHasVersion: SaveHasExpectedVersion<ThemeRepository> = true;
const _pageSaveHasVersion: SaveHasExpectedVersion<PageRepository> = true;
const _sectionTypeSaveHasVersion: SaveHasExpectedVersion<SectionTypeRepository> = true;
const _mediaSaveHasVersion: SaveHasExpectedVersion<MediaRepository> = true;
const _folderSaveHasVersion: SaveHasExpectedVersion<FolderRepository> = true;
const _formSaveHasVersion: SaveHasExpectedVersion<FormRepository> = true;
const _seoProfileSaveHasVersion: SaveHasExpectedVersion<SEOProfileRepository> = true;
const _schemaProfileSaveHasVersion: SaveHasExpectedVersion<SchemaProfileRepository> = true;
const _analyticsProfileSaveHasVersion: SaveHasExpectedVersion<AnalyticsProfileRepository> = true;
const _exportJobSaveHasVersion: SaveHasExpectedVersion<ExportJobRepository> = true;

/* ---------- save requires an aggregate with an ID ---------- */

const _orgSaveRequiresId: SaveRequiresId<OrganizationRepository> = true;
const _planSaveRequiresId: SaveRequiresId<PlanRepository> = true;
const _featureSaveRequiresId: SaveRequiresId<FeatureRepository> = true;
const _userSaveRequiresId: SaveRequiresId<UserRepository> = true;
const _membershipSaveRequiresId: SaveRequiresId<MembershipRepository> = true;
const _roleSaveRequiresId: SaveRequiresId<RoleRepository> = true;
const _websiteSaveRequiresId: SaveRequiresId<WebsiteRepository> = true;
const _navigationSaveRequiresId: SaveRequiresId<NavigationRepository> = true;
const _themeSaveRequiresId: SaveRequiresId<ThemeRepository> = true;
const _pageSaveRequiresId: SaveRequiresId<PageRepository> = true;
const _sectionTypeSaveRequiresId: SaveRequiresId<SectionTypeRepository> = true;
const _mediaSaveRequiresId: SaveRequiresId<MediaRepository> = true;
const _folderSaveRequiresId: SaveRequiresId<FolderRepository> = true;
const _formSaveRequiresId: SaveRequiresId<FormRepository> = true;
const _seoProfileSaveRequiresId: SaveRequiresId<SEOProfileRepository> = true;
const _schemaProfileSaveRequiresId: SaveRequiresId<SchemaProfileRepository> = true;
const _analyticsProfileSaveRequiresId: SaveRequiresId<AnalyticsProfileRepository> = true;
const _exportJobSaveRequiresId: SaveRequiresId<ExportJobRepository> = true;

/* ---------- PageSnapshotRepository: has create, no save, create has no expectedVersion ---------- */

const _snapshotHasCreate: HasCreate<PageSnapshotRepository> = true;
const _snapshotNoSave: HasSave<PageSnapshotRepository> = false;
const _snapshotCreateNoVersion: CreateHasNoExpectedVersion<PageSnapshotRepository> = true;

/* ---------- SubmissionRepository: create has no expectedVersion, updateStatus has expectedVersion ---------- */

const _submissionCreateNoVersion: CreateHasNoExpectedVersion<SubmissionRepository> = true;

type UpdateStatusHasExpectedVersion<T> = T extends { updateStatus: infer F }
  ? IsNever<NthParam<F, 2>> extends true
    ? false
    : NthParam<F, 2> extends AggregateVersion
      ? true
      : false
  : false;

const _submissionUpdateStatusHasVersion: UpdateStatusHasExpectedVersion<SubmissionRepository> = true;

/* ---------- RepositoryError and SaveResult are from Application (imported above) ---------- */

const _repoErrorShape: RepositoryError = { code: "test", message: "test" };
const _dupKeyErrorShape: DuplicateKeyError = { code: "duplicate_key", message: "test", field: "slug", value: "test" };
const _persistenceUnavailableShape: PersistenceUnavailableError = { code: "persistence_unavailable", message: "test" };
const _invalidPersistenceStateShape: InvalidPersistenceStateError = { code: "invalid_persistence_state", message: "test" };

/* ---------- ConcurrencyConflict from Domain ---------- */

const _conflictShape: ConcurrencyConflict = {
  aggregateId: "test",
  expectedVersion: 0,
  actualVersion: 1,
};

/* ---------- SaveResult and CreateResult are Application types ---------- */

type _SaveResultCheck = SaveResult<Organization> extends { ok: true; value: Organization } | { ok: false; error: SaveError } ? true : false;
const _saveResultIsCorrect: _SaveResultCheck = true;

type _CreateResultCheck = CreateResult<Organization> extends { ok: true; value: Organization } | { ok: false; error: CreateError } ? true : false;
const _createResultIsCorrect: _CreateResultCheck = true;

/* ---------- ConcurrencyConflict is in SaveError but NOT in CreateError ---------- */

type _ConflictInSaveError = ConcurrencyConflict extends SaveError ? true : false;
const _conflictInSaveError: _ConflictInSaveError = true;

type _ConflictNotInCreateError = ConcurrencyConflict extends CreateError ? true : false;
const _conflictNotInCreateError: _ConflictNotInCreateError = false;

export {
  _orgHasVersion, _planHasVersion, _featureHasVersion, _userHasVersion,
  _membershipHasVersion, _roleHasVersion, _websiteHasVersion, _navigationHasVersion,
  _themeHasVersion, _pageHasVersion, _sectionTypeHasVersion, _mediaHasVersion,
  _folderHasVersion, _formHasVersion, _submissionHasVersion, _seoHasVersion,
  _schemaHasVersion, _analyticsHasVersion, _exportJobHasVersion,
  _pluginHasVersion, _pluginInstallationHasVersion,
  _sectionNoVersion, _formFieldNoVersion, _menuItemNoVersion, _websiteSettingsNoVersion,
  _snapshotNoVersion, _snapshotHasRevision,
  _orgHasCreate, _orgHasSave, _planHasCreate, _planHasSave,
  _featureHasCreate, _featureHasSave, _userHasCreate, _userHasSave,
  _membershipHasCreate, _membershipHasSave, _roleHasCreate, _roleHasSave,
  _websiteHasCreate, _websiteHasSave, _navigationHasCreate, _navigationHasSave,
  _themeHasCreate, _themeHasSave, _pageHasCreate, _pageHasSave,
  _sectionTypeHasCreate, _sectionTypeHasSave, _mediaHasCreate, _mediaHasSave,
  _folderHasCreate, _folderHasSave, _formHasCreate, _formHasSave,
  _seoProfileHasCreate, _seoProfileHasSave, _schemaProfileHasCreate, _schemaProfileHasSave,
  _analyticsProfileHasCreate, _analyticsProfileHasSave, _exportJobHasCreate, _exportJobHasSave,
  _orgCreateNoVersion, _planCreateNoVersion, _featureCreateNoVersion, _userCreateNoVersion,
  _membershipCreateNoVersion, _roleCreateNoVersion, _websiteCreateNoVersion, _navigationCreateNoVersion,
  _themeCreateNoVersion, _pageCreateNoVersion, _sectionTypeCreateNoVersion, _mediaCreateNoVersion,
  _folderCreateNoVersion, _formCreateNoVersion, _seoProfileCreateNoVersion, _schemaProfileCreateNoVersion,
  _analyticsProfileCreateNoVersion, _exportJobCreateNoVersion,
  _orgSaveHasVersion, _planSaveHasVersion, _featureSaveHasVersion, _userSaveHasVersion,
  _membershipSaveHasVersion, _roleSaveHasVersion, _websiteSaveHasVersion, _navigationSaveHasVersion,
  _themeSaveHasVersion, _pageSaveHasVersion, _sectionTypeSaveHasVersion, _mediaSaveHasVersion,
  _folderSaveHasVersion, _formSaveHasVersion, _seoProfileSaveHasVersion, _schemaProfileSaveHasVersion,
  _analyticsProfileSaveHasVersion, _exportJobSaveHasVersion,
  _orgSaveRequiresId, _planSaveRequiresId, _featureSaveRequiresId, _userSaveRequiresId,
  _membershipSaveRequiresId, _roleSaveRequiresId, _websiteSaveRequiresId, _navigationSaveRequiresId,
  _themeSaveRequiresId, _pageSaveRequiresId, _sectionTypeSaveRequiresId, _mediaSaveRequiresId,
  _folderSaveRequiresId, _formSaveRequiresId, _seoProfileSaveRequiresId, _schemaProfileSaveRequiresId,
  _analyticsProfileSaveRequiresId, _exportJobSaveRequiresId,
  _snapshotHasCreate, _snapshotNoSave, _snapshotCreateNoVersion,
  _submissionCreateNoVersion, _submissionUpdateStatusHasVersion,
  _repoErrorShape, _dupKeyErrorShape, _persistenceUnavailableShape, _invalidPersistenceStateShape,
  _conflictShape, _saveResultIsCorrect, _createResultIsCorrect,
  _conflictInSaveError, _conflictNotInCreateError,
};
