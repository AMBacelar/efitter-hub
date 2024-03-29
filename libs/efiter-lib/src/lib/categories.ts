export const categories = [
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
];

export const getCategory = (product_name: string) => {
  return categories.filter(
    (category) =>
      category.keywords.filter((keyword) =>
        product_name.toLowerCase().includes(keyword)
      ).length
  )[0]?.name;
};
