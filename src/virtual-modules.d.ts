declare module "virtual:search-index" {
  const entries: {
    path: string;
    page: string;
    section: string;
    anchor: string;
    sub?: string;
  }[];
  export default entries;
}