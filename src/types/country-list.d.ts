declare module "country-list" {
  const countryList: {
    getName(code: string): string | undefined;
    getCode(name: string): string | undefined;
  };
  export default countryList;
}
