export interface BigNumber {
  lte(lessOrEqual: string | number, than: string | number): boolean;
  gt(greater: string | number, than: string | number): boolean;
}
