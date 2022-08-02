export const brands = {
  arket: 'Arket',
  asos: 'ASOS',
  bershka: 'Bershka',
  boohoo: 'Boohoo',
  cos: 'COS',
  hm: 'H&M',
  houseOfCB: 'House of CB',
  iSawItFirst: 'I Saw It First',
  mango: 'Mango',
  massimoDutti: 'Massimo Dutti',
  missguided: 'Missguided',
  monki: 'Monki',
  ms: 'M&S',
  nakd: 'NA-KD',
  newLook: 'New Look',
  next: 'Next',
  otherStories: 'OtherStories',
  plt: 'PrettyLittleThing',
  pullBear: 'Pull&Bear',
  riverIsland: 'River Island',
  stradivarius: 'Stradivarius',
  uniqlo: 'Uniqlo',
  weekday: 'Weekday',
  zara: 'Zara',
} as const;
type BrandKey = keyof typeof brands;
export type BrandValue = typeof brands[BrandKey];
const validAsosBrands = [
  'ASOS',
  'ASOS DESIGN',
  'ASOS EDITION',
  'ASOS WHITE',
  'ASOS MADE IN',
  'ASOS 4505',
  'ASOS LUXE',
  'Reclaimed Vintage',
  'COLLUSION',
];
export const findBrand = (stringContainingBrand: string) => {
  let itemBrand;
  const brandList: BrandValue[] = (Object.keys(brands) as BrandKey[]).reduce(
    (r: BrandValue[], key: BrandKey) => r.concat(brands[key]),
    []
  );

  // asos test
  for (let i = 0; i < validAsosBrands.length; i++) {
    const asosBrand = validAsosBrands[i];
    if (stringContainingBrand.toLowerCase().includes(asosBrand.toLowerCase())) {
      itemBrand = brands.asos;
      return itemBrand;
    }
  }

  for (let i = 0; i < brandList.length; i++) {
    const viableBrand: string = brandList[i];
    if (
      stringContainingBrand.toLowerCase().includes(viableBrand.toLowerCase())
    ) {
      itemBrand = viableBrand;
      return itemBrand;
    }
  }
  return;
};
