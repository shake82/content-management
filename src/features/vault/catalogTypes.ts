export interface IssueSeveritySummary {
  count: number;
  issueCountsByType: Record<string, number>;
}

export interface VaultCatalogItem {
  catalogId: number;
  secretEngine: string;
  path: string;
  secretVersion: number;
  property: string;
  type: string;
  secretSummary: {
    type: string;
    keyCountByType: Record<string, number>;
    issueSummaryBySeverity: Record<string, IssueSeveritySummary>;
  };
}

export interface VaultAggregateSummary {
  keyCountByType: Record<string, number>;
  issueSummaryBySeverity: Record<string, IssueSeveritySummary>;
  itemCount: number;
  secretEngines: string[];
}

export interface VaultTreeNode {
  name: string;
  fullPath: string;
  children: Record<string, VaultTreeNode>;
  items: VaultCatalogItem[];
  aggregate: VaultAggregateSummary;
}
