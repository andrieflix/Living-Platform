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
import type { Organization, Plan, Feature, User, Membership, Role, Website, WebsiteSettings, Navigation, MenuItem, Theme, Page, PageSnapshot, Section, SectionType, Media, Folder, Form, FormField, Submission, SEOProfile, SchemaProfile, AnalyticsProfile, ExportJob, Plugin, PluginInstallation, AggregateVersion, ConcurrencyConflict } from "@livingsites/domain";
import type { OrganizationRepository, PlanRepository, FeatureRepository, UserRepository, MembershipRepository, RoleRepository, WebsiteRepository, NavigationRepository, ThemeRepository, PageRepository, PageSnapshotRepository, SectionTypeRepository, MediaRepository, FolderRepository, FormRepository, SubmissionRepository, SEOProfileRepository, SchemaProfileRepository, AnalyticsProfileRepository, ExportJobRepository, RepositoryError, CreateResult, SaveResult, CreateError, SaveError, DuplicateKeyError, PersistenceUnavailableError, InvalidPersistenceStateError } from "@livingsites/application";
type HasVersion<T> = T extends {
    version: AggregateVersion;
} ? true : false;
/** true iff T is never (uses tuple wrapping to avoid distribution). */
type IsNever<T> = [T] extends [never] ? true : false;
/** Extracts the Nth parameter type (0-indexed) of a function; `never` if absent. */
type NthParam<F, N extends number> = F extends (...args: infer P) => unknown ? P[N] extends undefined ? never : P[N] : never;
/** Count the parameters of a function. */
type ParamCount<F> = F extends (...args: infer P) => unknown ? P["length"] : never;
/** true iff T has a `create` method whose only param does NOT include AggregateVersion. */
type CreateHasNoExpectedVersion<T> = T extends {
    create: infer F;
} ? IsNever<NthParam<F, 1>> extends true ? true : NthParam<F, 1> extends AggregateVersion ? false : true : false;
/** true iff T has a `save` method with exactly 2 params, second being AggregateVersion. */
type SaveHasExpectedVersion<T> = T extends {
    save: infer F;
} ? ParamCount<F> extends 2 ? IsNever<NthParam<F, 1>> extends true ? false : NthParam<F, 1> extends AggregateVersion ? true : false : false : false;
/** true iff T has a `save` method whose first param has an identity field (id or key). */
type SaveRequiresId<T> = T extends {
    save: (aggregate: infer A, ...rest: never[]) => unknown;
} ? A extends {
    id: unknown;
} ? true : A extends {
    key: unknown;
} ? true : false : false;
/** true iff T has a `create` method (distinct from save). */
type HasCreate<T> = T extends {
    create: unknown;
} ? true : false;
/** true iff T has a `save` method (distinct from create). */
type HasSave<T> = T extends {
    save: unknown;
} ? true : false;
/** Checks that PageSnapshot has revisionNumber and NOT version: AggregateVersion. */
type HasRevisionNumber<T> = T extends {
    revisionNumber: number;
} ? true : false;
declare const _orgHasVersion: HasVersion<Organization>;
declare const _planHasVersion: HasVersion<Plan>;
declare const _featureHasVersion: HasVersion<Feature>;
declare const _userHasVersion: HasVersion<User>;
declare const _membershipHasVersion: HasVersion<Membership>;
declare const _roleHasVersion: HasVersion<Role>;
declare const _websiteHasVersion: HasVersion<Website>;
declare const _navigationHasVersion: HasVersion<Navigation>;
declare const _themeHasVersion: HasVersion<Theme>;
declare const _pageHasVersion: HasVersion<Page>;
declare const _sectionTypeHasVersion: HasVersion<SectionType>;
declare const _mediaHasVersion: HasVersion<Media>;
declare const _folderHasVersion: HasVersion<Folder>;
declare const _formHasVersion: HasVersion<Form>;
declare const _submissionHasVersion: HasVersion<Submission>;
declare const _seoHasVersion: HasVersion<SEOProfile>;
declare const _schemaHasVersion: HasVersion<SchemaProfile>;
declare const _analyticsHasVersion: HasVersion<AnalyticsProfile>;
declare const _exportJobHasVersion: HasVersion<ExportJob>;
declare const _pluginHasVersion: HasVersion<Plugin>;
declare const _pluginInstallationHasVersion: HasVersion<PluginInstallation>;
declare const _sectionNoVersion: HasVersion<Section>;
declare const _formFieldNoVersion: HasVersion<FormField>;
declare const _menuItemNoVersion: HasVersion<MenuItem>;
declare const _websiteSettingsNoVersion: HasVersion<WebsiteSettings>;
declare const _snapshotNoVersion: HasVersion<PageSnapshot>;
declare const _snapshotHasRevision: HasRevisionNumber<PageSnapshot>;
declare const _orgHasCreate: HasCreate<OrganizationRepository>;
declare const _orgHasSave: HasSave<OrganizationRepository>;
declare const _planHasCreate: HasCreate<PlanRepository>;
declare const _planHasSave: HasSave<PlanRepository>;
declare const _featureHasCreate: HasCreate<FeatureRepository>;
declare const _featureHasSave: HasSave<FeatureRepository>;
declare const _userHasCreate: HasCreate<UserRepository>;
declare const _userHasSave: HasSave<UserRepository>;
declare const _membershipHasCreate: HasCreate<MembershipRepository>;
declare const _membershipHasSave: HasSave<MembershipRepository>;
declare const _roleHasCreate: HasCreate<RoleRepository>;
declare const _roleHasSave: HasSave<RoleRepository>;
declare const _websiteHasCreate: HasCreate<WebsiteRepository>;
declare const _websiteHasSave: HasSave<WebsiteRepository>;
declare const _navigationHasCreate: HasCreate<NavigationRepository>;
declare const _navigationHasSave: HasSave<NavigationRepository>;
declare const _themeHasCreate: HasCreate<ThemeRepository>;
declare const _themeHasSave: HasSave<ThemeRepository>;
declare const _pageHasCreate: HasCreate<PageRepository>;
declare const _pageHasSave: HasSave<PageRepository>;
declare const _sectionTypeHasCreate: HasCreate<SectionTypeRepository>;
declare const _sectionTypeHasSave: HasSave<SectionTypeRepository>;
declare const _mediaHasCreate: HasCreate<MediaRepository>;
declare const _mediaHasSave: HasSave<MediaRepository>;
declare const _folderHasCreate: HasCreate<FolderRepository>;
declare const _folderHasSave: HasSave<FolderRepository>;
declare const _formHasCreate: HasCreate<FormRepository>;
declare const _formHasSave: HasSave<FormRepository>;
declare const _seoProfileHasCreate: HasCreate<SEOProfileRepository>;
declare const _seoProfileHasSave: HasSave<SEOProfileRepository>;
declare const _schemaProfileHasCreate: HasCreate<SchemaProfileRepository>;
declare const _schemaProfileHasSave: HasSave<SchemaProfileRepository>;
declare const _analyticsProfileHasCreate: HasCreate<AnalyticsProfileRepository>;
declare const _analyticsProfileHasSave: HasSave<AnalyticsProfileRepository>;
declare const _exportJobHasCreate: HasCreate<ExportJobRepository>;
declare const _exportJobHasSave: HasSave<ExportJobRepository>;
declare const _orgCreateNoVersion: CreateHasNoExpectedVersion<OrganizationRepository>;
declare const _planCreateNoVersion: CreateHasNoExpectedVersion<PlanRepository>;
declare const _featureCreateNoVersion: CreateHasNoExpectedVersion<FeatureRepository>;
declare const _userCreateNoVersion: CreateHasNoExpectedVersion<UserRepository>;
declare const _membershipCreateNoVersion: CreateHasNoExpectedVersion<MembershipRepository>;
declare const _roleCreateNoVersion: CreateHasNoExpectedVersion<RoleRepository>;
declare const _websiteCreateNoVersion: CreateHasNoExpectedVersion<WebsiteRepository>;
declare const _navigationCreateNoVersion: CreateHasNoExpectedVersion<NavigationRepository>;
declare const _themeCreateNoVersion: CreateHasNoExpectedVersion<ThemeRepository>;
declare const _pageCreateNoVersion: CreateHasNoExpectedVersion<PageRepository>;
declare const _sectionTypeCreateNoVersion: CreateHasNoExpectedVersion<SectionTypeRepository>;
declare const _mediaCreateNoVersion: CreateHasNoExpectedVersion<MediaRepository>;
declare const _folderCreateNoVersion: CreateHasNoExpectedVersion<FolderRepository>;
declare const _formCreateNoVersion: CreateHasNoExpectedVersion<FormRepository>;
declare const _seoProfileCreateNoVersion: CreateHasNoExpectedVersion<SEOProfileRepository>;
declare const _schemaProfileCreateNoVersion: CreateHasNoExpectedVersion<SchemaProfileRepository>;
declare const _analyticsProfileCreateNoVersion: CreateHasNoExpectedVersion<AnalyticsProfileRepository>;
declare const _exportJobCreateNoVersion: CreateHasNoExpectedVersion<ExportJobRepository>;
declare const _orgSaveHasVersion: SaveHasExpectedVersion<OrganizationRepository>;
declare const _planSaveHasVersion: SaveHasExpectedVersion<PlanRepository>;
declare const _featureSaveHasVersion: SaveHasExpectedVersion<FeatureRepository>;
declare const _userSaveHasVersion: SaveHasExpectedVersion<UserRepository>;
declare const _membershipSaveHasVersion: SaveHasExpectedVersion<MembershipRepository>;
declare const _roleSaveHasVersion: SaveHasExpectedVersion<RoleRepository>;
declare const _websiteSaveHasVersion: SaveHasExpectedVersion<WebsiteRepository>;
declare const _navigationSaveHasVersion: SaveHasExpectedVersion<NavigationRepository>;
declare const _themeSaveHasVersion: SaveHasExpectedVersion<ThemeRepository>;
declare const _pageSaveHasVersion: SaveHasExpectedVersion<PageRepository>;
declare const _sectionTypeSaveHasVersion: SaveHasExpectedVersion<SectionTypeRepository>;
declare const _mediaSaveHasVersion: SaveHasExpectedVersion<MediaRepository>;
declare const _folderSaveHasVersion: SaveHasExpectedVersion<FolderRepository>;
declare const _formSaveHasVersion: SaveHasExpectedVersion<FormRepository>;
declare const _seoProfileSaveHasVersion: SaveHasExpectedVersion<SEOProfileRepository>;
declare const _schemaProfileSaveHasVersion: SaveHasExpectedVersion<SchemaProfileRepository>;
declare const _analyticsProfileSaveHasVersion: SaveHasExpectedVersion<AnalyticsProfileRepository>;
declare const _exportJobSaveHasVersion: SaveHasExpectedVersion<ExportJobRepository>;
declare const _orgSaveRequiresId: SaveRequiresId<OrganizationRepository>;
declare const _planSaveRequiresId: SaveRequiresId<PlanRepository>;
declare const _featureSaveRequiresId: SaveRequiresId<FeatureRepository>;
declare const _userSaveRequiresId: SaveRequiresId<UserRepository>;
declare const _membershipSaveRequiresId: SaveRequiresId<MembershipRepository>;
declare const _roleSaveRequiresId: SaveRequiresId<RoleRepository>;
declare const _websiteSaveRequiresId: SaveRequiresId<WebsiteRepository>;
declare const _navigationSaveRequiresId: SaveRequiresId<NavigationRepository>;
declare const _themeSaveRequiresId: SaveRequiresId<ThemeRepository>;
declare const _pageSaveRequiresId: SaveRequiresId<PageRepository>;
declare const _sectionTypeSaveRequiresId: SaveRequiresId<SectionTypeRepository>;
declare const _mediaSaveRequiresId: SaveRequiresId<MediaRepository>;
declare const _folderSaveRequiresId: SaveRequiresId<FolderRepository>;
declare const _formSaveRequiresId: SaveRequiresId<FormRepository>;
declare const _seoProfileSaveRequiresId: SaveRequiresId<SEOProfileRepository>;
declare const _schemaProfileSaveRequiresId: SaveRequiresId<SchemaProfileRepository>;
declare const _analyticsProfileSaveRequiresId: SaveRequiresId<AnalyticsProfileRepository>;
declare const _exportJobSaveRequiresId: SaveRequiresId<ExportJobRepository>;
declare const _snapshotHasCreate: HasCreate<PageSnapshotRepository>;
declare const _snapshotNoSave: HasSave<PageSnapshotRepository>;
declare const _snapshotCreateNoVersion: CreateHasNoExpectedVersion<PageSnapshotRepository>;
declare const _submissionCreateNoVersion: CreateHasNoExpectedVersion<SubmissionRepository>;
type UpdateStatusHasExpectedVersion<T> = T extends {
    updateStatus: infer F;
} ? IsNever<NthParam<F, 2>> extends true ? false : NthParam<F, 2> extends AggregateVersion ? true : false : false;
declare const _submissionUpdateStatusHasVersion: UpdateStatusHasExpectedVersion<SubmissionRepository>;
declare const _repoErrorShape: RepositoryError;
declare const _dupKeyErrorShape: DuplicateKeyError;
declare const _persistenceUnavailableShape: PersistenceUnavailableError;
declare const _invalidPersistenceStateShape: InvalidPersistenceStateError;
declare const _conflictShape: ConcurrencyConflict;
type _SaveResultCheck = SaveResult<Organization> extends {
    ok: true;
    value: Organization;
} | {
    ok: false;
    error: SaveError;
} ? true : false;
declare const _saveResultIsCorrect: _SaveResultCheck;
type _CreateResultCheck = CreateResult<Organization> extends {
    ok: true;
    value: Organization;
} | {
    ok: false;
    error: CreateError;
} ? true : false;
declare const _createResultIsCorrect: _CreateResultCheck;
type _ConflictInSaveError = ConcurrencyConflict extends SaveError ? true : false;
declare const _conflictInSaveError: _ConflictInSaveError;
type _ConflictNotInCreateError = ConcurrencyConflict extends CreateError ? true : false;
declare const _conflictNotInCreateError: _ConflictNotInCreateError;
export { _orgHasVersion, _planHasVersion, _featureHasVersion, _userHasVersion, _membershipHasVersion, _roleHasVersion, _websiteHasVersion, _navigationHasVersion, _themeHasVersion, _pageHasVersion, _sectionTypeHasVersion, _mediaHasVersion, _folderHasVersion, _formHasVersion, _submissionHasVersion, _seoHasVersion, _schemaHasVersion, _analyticsHasVersion, _exportJobHasVersion, _pluginHasVersion, _pluginInstallationHasVersion, _sectionNoVersion, _formFieldNoVersion, _menuItemNoVersion, _websiteSettingsNoVersion, _snapshotNoVersion, _snapshotHasRevision, _orgHasCreate, _orgHasSave, _planHasCreate, _planHasSave, _featureHasCreate, _featureHasSave, _userHasCreate, _userHasSave, _membershipHasCreate, _membershipHasSave, _roleHasCreate, _roleHasSave, _websiteHasCreate, _websiteHasSave, _navigationHasCreate, _navigationHasSave, _themeHasCreate, _themeHasSave, _pageHasCreate, _pageHasSave, _sectionTypeHasCreate, _sectionTypeHasSave, _mediaHasCreate, _mediaHasSave, _folderHasCreate, _folderHasSave, _formHasCreate, _formHasSave, _seoProfileHasCreate, _seoProfileHasSave, _schemaProfileHasCreate, _schemaProfileHasSave, _analyticsProfileHasCreate, _analyticsProfileHasSave, _exportJobHasCreate, _exportJobHasSave, _orgCreateNoVersion, _planCreateNoVersion, _featureCreateNoVersion, _userCreateNoVersion, _membershipCreateNoVersion, _roleCreateNoVersion, _websiteCreateNoVersion, _navigationCreateNoVersion, _themeCreateNoVersion, _pageCreateNoVersion, _sectionTypeCreateNoVersion, _mediaCreateNoVersion, _folderCreateNoVersion, _formCreateNoVersion, _seoProfileCreateNoVersion, _schemaProfileCreateNoVersion, _analyticsProfileCreateNoVersion, _exportJobCreateNoVersion, _orgSaveHasVersion, _planSaveHasVersion, _featureSaveHasVersion, _userSaveHasVersion, _membershipSaveHasVersion, _roleSaveHasVersion, _websiteSaveHasVersion, _navigationSaveHasVersion, _themeSaveHasVersion, _pageSaveHasVersion, _sectionTypeSaveHasVersion, _mediaSaveHasVersion, _folderSaveHasVersion, _formSaveHasVersion, _seoProfileSaveHasVersion, _schemaProfileSaveHasVersion, _analyticsProfileSaveHasVersion, _exportJobSaveHasVersion, _orgSaveRequiresId, _planSaveRequiresId, _featureSaveRequiresId, _userSaveRequiresId, _membershipSaveRequiresId, _roleSaveRequiresId, _websiteSaveRequiresId, _navigationSaveRequiresId, _themeSaveRequiresId, _pageSaveRequiresId, _sectionTypeSaveRequiresId, _mediaSaveRequiresId, _folderSaveRequiresId, _formSaveRequiresId, _seoProfileSaveRequiresId, _schemaProfileSaveRequiresId, _analyticsProfileSaveRequiresId, _exportJobSaveRequiresId, _snapshotHasCreate, _snapshotNoSave, _snapshotCreateNoVersion, _submissionCreateNoVersion, _submissionUpdateStatusHasVersion, _repoErrorShape, _dupKeyErrorShape, _persistenceUnavailableShape, _invalidPersistenceStateShape, _conflictShape, _saveResultIsCorrect, _createResultIsCorrect, _conflictInSaveError, _conflictNotInCreateError, };
//# sourceMappingURL=contracts.version-checks.d.ts.map