import { catalogFixture } from '../../test/fixtures';
import { buildVaultTree } from './buildVaultTree';

it('builds the folder hierarchy and aggregates catalog summaries through every ancestor', () => {
  const tree = buildVaultTree(catalogFixture);

  expect(Object.keys(tree.children)).toEqual(['engine-a', 'engine-b', 'engine-c']);
  expect(tree.aggregate.itemCount).toBe(3);
  expect(tree.aggregate.keyCountByType).toEqual({ KEY_PAIR: 1, TRUSTED_CERTIFICATE: 2, CERTIFICATE: 3 });
  expect(tree.aggregate.issueSummaryBySeverity.HIGH.count).toBe(1);
  expect(tree.children['engine-a'].aggregate.itemCount).toBe(1);
  expect(tree.children['engine-a'].children.apps.children.prod.children.payments.items[0].catalogId).toBe(1);
  expect(tree.children['engine-a'].children.apps.fullPath).toBe('engine-a/apps');
});
