import type { VaultTreeNode } from './catalogTypes';

export function getNodeByPath(root: VaultTreeNode, path: string): VaultTreeNode | undefined {
  const segments = path.split('/').filter(Boolean);
  return segments.reduce<VaultTreeNode | undefined>(
    (node, segment) => node?.children[segment],
    root,
  );
}

export function getVisibleFolders(node: VaultTreeNode, query: string): VaultTreeNode[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return Object.values(node.children)
    .filter((child) => {
      if (!normalizedQuery) return true;
      const searchable = [
        child.name,
        child.fullPath,
        ...child.aggregate.secretEngines,
        ...Object.keys(child.aggregate.issueSummaryBySeverity),
      ].join(' ').toLocaleLowerCase();
      return searchable.includes(normalizedQuery);
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}
