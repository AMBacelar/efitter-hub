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

const categories = [
  {
    name: 'One-pieces',
    keywords: [
      'boiler suit',
      'boilersuit',
      'dress',
      'dungaree',
      'gown',
      'jumpsuit',
      'kimono',
      'LBD',
      'overall',
      'pinafore',
      'playsuit',
      'sundress',
      'unitard',
    ],
  },
  {
    name: 'Outerwear',
    keywords: [
      'blazer',
      'coat',
      'fleece',
      'gilet',
      'hoodie',
      'jacket',
      'overshirt',
      'overcoat',
      'parka',
      'poncho',
      'puffer',
      'raincoat',
      'shacket',
      'waistcoat',
      'trench',
    ],
  },
  {
    name: 'Tops',
    keywords: [
      'blouse',
      'bodice',
      'body',
      'bodysuit',
      'camisole',
      'cardigan',
      'chemise',
      'corset',
      'dashiki',
      'jumper',
      'leotard',
      'polo',
      'shirt',
      'shirtdress',
      'sweater',
      'sweatshirt',
      't-shirt',
      'top',
      'tunic',
      'vest',
    ],
  },
  {
    name: 'Bottoms',
    keywords: [
      'bell-bottom',
      'capri',
      'chino',
      'culotte',
      'flare',
      'jean',
      'jegging',
      'Jodhpur',
      'jogger',
      'khakis',
      'legging',
      'miniskirt',
      'pant',
      'sarong',
      'short',
      'skirt',
      'skort',
      'sport tight',
      'sports tight',
      'sweatpant',
      'tracksuit',
      'trouser',
      'trunks',
      'tutu',
    ],
  },
] as const;

export const brands = {
  arket: 'ARKET',
  asos: 'ASOS',
  bershka: 'Bershka',
  boohoo: 'Boohoo',
  hm: 'H&M',
  houseOfCB: 'House of CB',
  iSawItFirst: 'I Saw It First',
  mango: 'Mango',
  massimoDutti: 'Massimo Dutti',
  missguided: 'Missguided',
  monki: 'Monki',
  ms: 'M&S',
  nakd: 'NA-KD',
  next: 'Next',
  otherStories: 'OtherStories',
  plt: 'PrettyLittleThing',
  pullBear: 'Pull&Bear',
  stradivarius: 'Stradivarius',
  uniqlo: 'Uniqlo',
  zara: 'Zara',
} as const;
type BrandKey = keyof typeof brands;
type BrandValue = typeof brands[BrandKey];

const findBrand = (stringContainingBrand) => {
  let itemBrand;
  const brandList = Object.keys(brands).reduce(function (r, k) {
    return r.concat(brands[k]);
  }, []);

  // asos test
  for (let i = 0; i < validAsosBrands.length; i++) {
    const asosBrand = validAsosBrands[i];
    if (stringContainingBrand.toLowerCase().includes(asosBrand.toLowerCase())) {
      itemBrand = brands.asos;
      return itemBrand;
    }
  }

  for (let i = 0; i < brandList.length; i++) {
    const viableBrand = brandList[i];
    if (
      stringContainingBrand.toLowerCase().includes(viableBrand.toLowerCase())
    ) {
      itemBrand = viableBrand;
      return itemBrand;
    }
  }
  return;
};

type Item = {
  name: string;
  brand: BrandValue;
  size: string;
};

const parseEmailFunctions = {
  [brands.arket]: (body): Item[] => [],
  [brands.asos]: (body): Item[] => [],
  [brands.bershka]: (body): Item[] => [],
  [brands.boohoo]: (body): Item[] => [],
  [brands.hm]: (body): Item[] => [],
  [brands.houseOfCB]: (body): Item[] => [],
  [brands.iSawItFirst]: (body): Item[] => {
    const items = [];
    let formattedLines = body.replace(/<\/?[^>]+>/gi, ' ').trim();
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('ORDER DETAILS' + 13),
      formattedLines.lastIndexOf('Subtotal')
    );

    formattedLines = formattedLines.split('Quantity:');

    formattedLines.forEach((itemBlock) => {
      let name = null;
      let size = null;
      let lines = itemBlock.split(/\n/g);
      lines = lines.reduce((lines, line) => {
        if (line.trim() !== '') {
          lines.push(line.trim());
        }
        return lines;
      }, []);

      // get name

      for (let index = 0; index < lines.length; index++) {
        const potentialItemName = lines[index];
        for (const category in categories) {
          if (Object.hasOwnProperty.call(categories, category)) {
            const clothingCategory = categories[category];
            for (const keyword in clothingCategory.keywords) {
              if (
                Object.hasOwnProperty.call(clothingCategory.keywords, keyword)
              ) {
                const key = clothingCategory.keywords[keyword];
                if (
                  potentialItemName.toLowerCase().includes(key.toLowerCase())
                ) {
                  name = potentialItemName;
                }
              }
            }
          }
        }
      }

      // get size
      size = lines.filter((line) => line.includes('Size:'));
      if (size.length > 0) {
        size = size[0].replace('Size:', '').trim();
      } else {
        size = null;
      }
      if (!!size && !!name) {
        items.push({
          name,
          size,
          brandName: brands.iSawItFirst,
        });
      }
    });

    return items;
  },
  [brands.mango]: (body): Item[] => {
    const items = [];
    let array = body
      .substring(body.lastIndexOf('Order number'), body.lastIndexOf('Subtotal'))
      .split('\n');

    array = array.reduce((array, line) => {
      if (line.replace(/<\/?[^>]+>/gi, ' ').trim() !== '') {
        array.push(line.replace(/<\/?[^>]+>/gi, ' ').trim());
      }
      return array;
    }, []);

    for (let i = 0; i < array.length; i++) {
      const line = array[i];
      if (line.includes('Size')) {
        let size = line.replace('Size', '');
        if (size.includes('Color')) size = size.replace('Color', '');
        items.push({
          name: array[i - 2].trim(),
          size: size.trim(),
          brandName: brands.mango,
        });
      }
    }
    return items;
  },
  [brands.massimoDutti]: (body): Item[] => [],
  [brands.missguided]: (body): Item[] => {
    const items = [];
    let lines = body
      .substring(
        body.search(/Item\s+Description\s+Price/),
        body.lastIndexOf('Subtotal')
      )
      .split(/\n|\r/g);

    lines = lines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    for (let i = 0; i < lines.length; i++) {
      let name = '';
      if (lines[i].includes('Size: ')) {
        let steps = 1;
        while (name === '') {
          if (lines[i - steps]) {
            if (lines[i - steps].match(/Item\s+Description\s+Price/)) {
              name = lines
                .slice(i - steps, i)
                .toString()
                .replace(/,/g, ' ');
              name = name.substring(name.lastIndexOf('Price') + 5).trim();
            } else {
              steps++;
            }
          } else {
            name = null;
            break;
          }
        }
        items.push({
          name,
          size: lines[i].split('Size: ')[1].split(',')[0],
          brandName: brands.missguided,
        });
      }
    }
    return items;
  },
  [brands.monki]: (body): Item[] => [],
  [brands.ms]: (body): Item[] => [],
  [brands.nakd]: (body): Item[] => [],
  [brands.next]: (body): Item[] => [],
  [brands.otherStories]: (body): Item[] => [],
  [brands.plt]: (body): Item[] => [],
  [brands.pullBear]: (body): Item[] => [],
  [brands.stradivarius]: (body): Item[] => [],
  [brands.uniqlo]: (body): Item[] => [],
  [brands.zara]: (body): Item[] => [],
};

export const fetchItems = (body: string, brand: BrandValue) =>
  parseEmailFunctions[brand](body);

export const emailValidator = (messageBody, subject) => {
  const brandName = findBrandName(messageBody, subject);
  const isValidSubjectLine = !!brandName;

  if (brandName === '') {
    return { isValidSubjectLine, items: [] };
  }

  const items = fetchItems(messageBody, brandName);
  return {
    isValidSubjectLine,
    items,
  };
};

const findBrandName = (messageBody: string, subject: string) => {
  if (subject === undefined) return '';
  if (subject.toLowerCase().includes('Thanks for your order'.toLowerCase())) {
    if (messageBody.includes('Next Retail Ltd')) {
      // Next
      return brands.next;
    } else {
      //ASOS
      return brands.asos;
    }
  } else if (
    subject.toLowerCase().includes('Your order confirmation'.toLowerCase())
  ) {
    //PrettyLittleThing
    return brands.plt;
  } else if (subject.toLowerCase().includes('in the bag'.toLowerCase())) {
    //Boohoo
    return brands.boohoo;
  } else if (
    subject
      .toLowerCase()
      .includes('Thank you for shopping at MANGO'.toLowerCase())
  ) {
    //Mango
    return brands.mango;
  } else if (
    subject
      .toLowerCase()
      .includes('Missguided: Order Confirmation'.toLowerCase())
  ) {
    //Missguided
    return brands.missguided;
  } else if (
    subject.toLowerCase().includes('We have received your order'.toLowerCase())
  ) {
    // NA-KD
    return brands.nakd;
  } else if (
    subject
      .toLowerCase()
      .includes('Your I SAW IT FIRST Order Confirmation'.toLowerCase())
  ) {
    // I SAW IT FIRST
    return brands.iSawItFirst;
  } else if (
    subject.toLowerCase().includes('Order confirmation'.toLowerCase()) &&
    !subject.toLowerCase().includes('zara')
  ) {
    if (messageBody.toLowerCase().includes('other stories')) {
      // & Other Stories
      return brands.otherStories;
    } else if (subject.toLowerCase().includes('HouseofCB'.toLowerCase())) {
      // House of CB
      return brands.houseOfCB;
    } else if (
      messageBody.toLowerCase().includes('for more information about arket')
    ) {
      // Arket
      return brands.arket;
    } else {
      //H&M
      return brands.hm;
    }
  } else if (
    subject
      .toLowerCase()
      .includes('Thank you! Your order has been received'.toLowerCase())
  ) {
    // Uniqlo
    return brands.uniqlo;
  } else if (subject.toLowerCase().match(/order \d* confirmed/gm)) {
    // Bershka
    return brands.bershka;
  } else if (
    subject
      .toLowerCase()
      .includes(
        'Thank you for your purchase! Confirmation of order no.'.toLowerCase()
      )
  ) {
    // Pull&Bear
    return brands.pullBear;
  } else if (
    subject.toLowerCase().includes('Thank you for your purchase'.toLowerCase())
  ) {
    //ZARA
    return brands.zara;
  } else if (
    subject.toLowerCase().includes('We got your order!'.toLowerCase())
  ) {
    // Monki
    // TODO  sizechart for smaller increments for Monki's sake
    return brands.monki;
  } else if (
    subject.toLowerCase().includes('Thanks for your purchase'.toLowerCase())
  ) {
    // Stradivarius
    return brands.stradivarius;
  } else if (
    subject.toLowerCase().includes('Confirmation of order nº'.toLowerCase())
  ) {
    // Massimo Dutti
    return brands.massimoDutti;
  } else if (
    subject.toLowerCase().includes('Thanks for shopping with us'.toLowerCase())
  ) {
    // M&S
    return brands.ms;
  }
  return '';
};
