interface Settings {
  enabled: boolean;
  useIaFilter: boolean;
  useUdm: boolean;
  useSnippetFilter: boolean;
}

interface FilterOptions {
  useIaFilter: boolean;
  useUdm: boolean;
}

interface TransformResult {
  url: string;
  modified: boolean;
}
