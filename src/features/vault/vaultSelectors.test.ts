import { catalogFixture } from '../../test/fixtures';
import { buildVaultTree } from './buildVaultTree';
import { getNodeByPath, getVisibleFolders } from './vaultSelectors';

it('finds a path and filters its direct children by folder metadata', () => {
  const tree = buildVaultTree(catalogFixture);
  const root = getNodeByPath(tree, '');

  expect(root?.name).toBe('Vault');
  expect(getVisibleFolders(root!, '')).toHaveLength(3);
  expect(getVisibleFolders(root!, 'ENGINE-B').map((folder) => folder.name)).toEqual(['engine-b']);
  expect(getNodeByPath(tree, 'engine-a/apps/prod')?.name).toBe('prod');
  expect(getNodeByPath(tree, 'missing')).toBeUndefined();
});
