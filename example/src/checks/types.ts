export type Check = [label: string, run: () => Promise<void> | void];

export type ModuleChecks = {
  name: string;
  checks: Check[];
};
