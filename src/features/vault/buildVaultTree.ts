import type {
  IssueSeveritySummary,
  VaultAggregateSummary,
  VaultCatalogItem,
  VaultTreeNode,
} from './catalogTypes';

function emptyAggregate(): VaultAggregateSummary {
  return {
    keyCountByType: {},
    issueSummaryBySeverity: {},
    itemCount: 0,
    secretEngines: [],
  };
}

function makeNode(name: string, fullPath: string): VaultTreeNode {
  return { name, fullPath, children: {}, items: [], aggregate: emptyAggregate() };
}

function addIssueSummary(
  target: Record<string, IssueSeveritySummary>,
  source: Record<string, IssueSeveritySummary>,
) {
  Object.entries(source).forEach(([severity, summary]) => {
    const destination = target[severity] ?? { count: 0, issueCountsByType: {} };
    destination.count += summary.count;
    Object.entries(summary.issueCountsByType).forEach(([type, count]) => {
      destination.issueCountsByType[type] = (destination.issueCountsByType[type] ?? 0) + count;
    });
    target[severity] = destination;
  });
}

function addItemToAggregate(aggregate: VaultAggregateSummary, item: VaultCatalogItem) {
  aggregate.itemCount += 1;
  Object.entries(item.secretSummary.keyCountByType).forEach(([type, count]) => {
    aggregate.keyCountByType[type] = (aggregate.keyCountByType[type] ?? 0) + count;
  });
  addIssueSummary(aggregate.issueSummaryBySeverity, item.secretSummary.issueSummaryBySeverity);
  if (!aggregate.secretEngines.includes(item.secretEngine)) {
    aggregate.secretEngines.push(item.secretEngine);
    aggregate.secretEngines.sort();
  }
}

export function buildVaultTree(items: VaultCatalogItem[]): VaultTreeNode {
  const root = makeNode('Vault', '');

  items.forEach((item) => {
    const segments = [
      item.secretEngine.trim(),
      ...item.path.split('/').map((segment) => segment.trim()),
    ].filter(Boolean);
    let current = root;
    addItemToAggregate(current.aggregate, item);

    segments.forEach((segment, index) => {
      const fullPath = segments.slice(0, index + 1).join('/');
      current.children[segment] ??= makeNode(segment, fullPath);
      current = current.children[segment];
      addItemToAggregate(current.aggregate, item);
    });

    current.items.push(item);
  });

  return root;
}
