/* ---------- Mutable roots require version: AggregateVersion ---------- */
const _orgHasVersion = true;
const _planHasVersion = true;
const _featureHasVersion = true;
const _userHasVersion = true;
const _membershipHasVersion = true;
const _roleHasVersion = true;
const _websiteHasVersion = true;
const _navigationHasVersion = true;
const _themeHasVersion = true;
const _pageHasVersion = true;
const _sectionTypeHasVersion = true;
const _mediaHasVersion = true;
const _folderHasVersion = true;
const _formHasVersion = true;
const _submissionHasVersion = true;
const _seoHasVersion = true;
const _schemaHasVersion = true;
const _analyticsHasVersion = true;
const _exportJobHasVersion = true;
const _pluginHasVersion = true;
const _pluginInstallationHasVersion = true;
/* ---------- Child entities do NOT have AggregateVersion ---------- */
const _sectionNoVersion = false;
const _formFieldNoVersion = false;
const _menuItemNoVersion = false;
const _websiteSettingsNoVersion = false;
/* ---------- PageSnapshot: no AggregateVersion, has revisionNumber ---------- */
const _snapshotNoVersion = false;
const _snapshotHasRevision = true;
/* ---------- Repositories have distinct create and save ---------- */
const _orgHasCreate = true;
const _orgHasSave = true;
const _planHasCreate = true;
const _planHasSave = true;
const _featureHasCreate = true;
const _featureHasSave = true;
const _userHasCreate = true;
const _userHasSave = true;
const _membershipHasCreate = true;
const _membershipHasSave = true;
const _roleHasCreate = true;
const _roleHasSave = true;
const _websiteHasCreate = true;
const _websiteHasSave = true;
const _navigationHasCreate = true;
const _navigationHasSave = true;
const _themeHasCreate = true;
const _themeHasSave = true;
const _pageHasCreate = true;
const _pageHasSave = true;
const _sectionTypeHasCreate = true;
const _sectionTypeHasSave = true;
const _mediaHasCreate = true;
const _mediaHasSave = true;
const _folderHasCreate = true;
const _folderHasSave = true;
const _formHasCreate = true;
const _formHasSave = true;
const _seoProfileHasCreate = true;
const _seoProfileHasSave = true;
const _schemaProfileHasCreate = true;
const _schemaProfileHasSave = true;
const _analyticsProfileHasCreate = true;
const _analyticsProfileHasSave = true;
const _exportJobHasCreate = true;
const _exportJobHasSave = true;
/* ---------- create does NOT require expectedVersion ---------- */
const _orgCreateNoVersion = true;
const _planCreateNoVersion = true;
const _featureCreateNoVersion = true;
const _userCreateNoVersion = true;
const _membershipCreateNoVersion = true;
const _roleCreateNoVersion = true;
const _websiteCreateNoVersion = true;
const _navigationCreateNoVersion = true;
const _themeCreateNoVersion = true;
const _pageCreateNoVersion = true;
const _sectionTypeCreateNoVersion = true;
const _mediaCreateNoVersion = true;
const _folderCreateNoVersion = true;
const _formCreateNoVersion = true;
const _seoProfileCreateNoVersion = true;
const _schemaProfileCreateNoVersion = true;
const _analyticsProfileCreateNoVersion = true;
const _exportJobCreateNoVersion = true;
/* ---------- save requires expectedVersion ---------- */
const _orgSaveHasVersion = true;
const _planSaveHasVersion = true;
const _featureSaveHasVersion = true;
const _userSaveHasVersion = true;
const _membershipSaveHasVersion = true;
const _roleSaveHasVersion = true;
const _websiteSaveHasVersion = true;
const _navigationSaveHasVersion = true;
const _themeSaveHasVersion = true;
const _pageSaveHasVersion = true;
const _sectionTypeSaveHasVersion = true;
const _mediaSaveHasVersion = true;
const _folderSaveHasVersion = true;
const _formSaveHasVersion = true;
const _seoProfileSaveHasVersion = true;
const _schemaProfileSaveHasVersion = true;
const _analyticsProfileSaveHasVersion = true;
const _exportJobSaveHasVersion = true;
/* ---------- save requires an aggregate with an ID ---------- */
const _orgSaveRequiresId = true;
const _planSaveRequiresId = true;
const _featureSaveRequiresId = true;
const _userSaveRequiresId = true;
const _membershipSaveRequiresId = true;
const _roleSaveRequiresId = true;
const _websiteSaveRequiresId = true;
const _navigationSaveRequiresId = true;
const _themeSaveRequiresId = true;
const _pageSaveRequiresId = true;
const _sectionTypeSaveRequiresId = true;
const _mediaSaveRequiresId = true;
const _folderSaveRequiresId = true;
const _formSaveRequiresId = true;
const _seoProfileSaveRequiresId = true;
const _schemaProfileSaveRequiresId = true;
const _analyticsProfileSaveRequiresId = true;
const _exportJobSaveRequiresId = true;
/* ---------- PageSnapshotRepository: has create, no save, create has no expectedVersion ---------- */
const _snapshotHasCreate = true;
const _snapshotNoSave = false;
const _snapshotCreateNoVersion = true;
/* ---------- SubmissionRepository: create has no expectedVersion, updateStatus has expectedVersion ---------- */
const _submissionCreateNoVersion = true;
const _submissionUpdateStatusHasVersion = true;
/* ---------- RepositoryError and SaveResult are from Application (imported above) ---------- */
const _repoErrorShape = { code: "test", message: "test" };
const _dupKeyErrorShape = { code: "duplicate_key", message: "test", field: "slug", value: "test" };
const _persistenceUnavailableShape = { code: "persistence_unavailable", message: "test" };
const _invalidPersistenceStateShape = { code: "invalid_persistence_state", message: "test" };
/* ---------- ConcurrencyConflict from Domain ---------- */
const _conflictShape = {
    aggregateId: "test",
    expectedVersion: 0,
    actualVersion: 1,
};
const _saveResultIsCorrect = true;
const _createResultIsCorrect = true;
const _conflictInSaveError = true;
const _conflictNotInCreateError = false;
export { _orgHasVersion, _planHasVersion, _featureHasVersion, _userHasVersion, _membershipHasVersion, _roleHasVersion, _websiteHasVersion, _navigationHasVersion, _themeHasVersion, _pageHasVersion, _sectionTypeHasVersion, _mediaHasVersion, _folderHasVersion, _formHasVersion, _submissionHasVersion, _seoHasVersion, _schemaHasVersion, _analyticsHasVersion, _exportJobHasVersion, _pluginHasVersion, _pluginInstallationHasVersion, _sectionNoVersion, _formFieldNoVersion, _menuItemNoVersion, _websiteSettingsNoVersion, _snapshotNoVersion, _snapshotHasRevision, _orgHasCreate, _orgHasSave, _planHasCreate, _planHasSave, _featureHasCreate, _featureHasSave, _userHasCreate, _userHasSave, _membershipHasCreate, _membershipHasSave, _roleHasCreate, _roleHasSave, _websiteHasCreate, _websiteHasSave, _navigationHasCreate, _navigationHasSave, _themeHasCreate, _themeHasSave, _pageHasCreate, _pageHasSave, _sectionTypeHasCreate, _sectionTypeHasSave, _mediaHasCreate, _mediaHasSave, _folderHasCreate, _folderHasSave, _formHasCreate, _formHasSave, _seoProfileHasCreate, _seoProfileHasSave, _schemaProfileHasCreate, _schemaProfileHasSave, _analyticsProfileHasCreate, _analyticsProfileHasSave, _exportJobHasCreate, _exportJobHasSave, _orgCreateNoVersion, _planCreateNoVersion, _featureCreateNoVersion, _userCreateNoVersion, _membershipCreateNoVersion, _roleCreateNoVersion, _websiteCreateNoVersion, _navigationCreateNoVersion, _themeCreateNoVersion, _pageCreateNoVersion, _sectionTypeCreateNoVersion, _mediaCreateNoVersion, _folderCreateNoVersion, _formCreateNoVersion, _seoProfileCreateNoVersion, _schemaProfileCreateNoVersion, _analyticsProfileCreateNoVersion, _exportJobCreateNoVersion, _orgSaveHasVersion, _planSaveHasVersion, _featureSaveHasVersion, _userSaveHasVersion, _membershipSaveHasVersion, _roleSaveHasVersion, _websiteSaveHasVersion, _navigationSaveHasVersion, _themeSaveHasVersion, _pageSaveHasVersion, _sectionTypeSaveHasVersion, _mediaSaveHasVersion, _folderSaveHasVersion, _formSaveHasVersion, _seoProfileSaveHasVersion, _schemaProfileSaveHasVersion, _analyticsProfileSaveHasVersion, _exportJobSaveHasVersion, _orgSaveRequiresId, _planSaveRequiresId, _featureSaveRequiresId, _userSaveRequiresId, _membershipSaveRequiresId, _roleSaveRequiresId, _websiteSaveRequiresId, _navigationSaveRequiresId, _themeSaveRequiresId, _pageSaveRequiresId, _sectionTypeSaveRequiresId, _mediaSaveRequiresId, _folderSaveRequiresId, _formSaveRequiresId, _seoProfileSaveRequiresId, _schemaProfileSaveRequiresId, _analyticsProfileSaveRequiresId, _exportJobSaveRequiresId, _snapshotHasCreate, _snapshotNoSave, _snapshotCreateNoVersion, _submissionCreateNoVersion, _submissionUpdateStatusHasVersion, _repoErrorShape, _dupKeyErrorShape, _persistenceUnavailableShape, _invalidPersistenceStateShape, _conflictShape, _saveResultIsCorrect, _createResultIsCorrect, _conflictInSaveError, _conflictNotInCreateError, };
//# sourceMappingURL=contracts.version-checks.js.map