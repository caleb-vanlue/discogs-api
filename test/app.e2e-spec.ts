// E2E tests require a live database and environment variables.
// Run manually against a running instance rather than in CI.
describe('App (e2e)', () => {
  it.todo('GET /collection/:userId returns paginated collection');
  it.todo('GET /collection/:userId/wantlist returns paginated wantlist');
  it.todo('GET /discogs/suggestions/:userId returns suggestions');
  it.todo('Unauthenticated requests return 401');
});
