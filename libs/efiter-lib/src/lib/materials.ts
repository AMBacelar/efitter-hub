export const getMaterialsFromString = (inputString: string) => {
  const materials: Materials[] = [];
  matcharacteristic.forEach((material) => {
    if (inputString.toLowerCase().includes(material.Name.toLowerCase())) {
      materials.push(material.Name);
    }
  });
  const TencelIndex = materials.indexOf('Tencel');
  const lyocellIndex = materials.indexOf('Lyocell');
  const hasLyocell = lyocellIndex !== -1;
  const hasTencel = TencelIndex !== -1;
  if (hasLyocell && hasTencel) {
    materials.splice(TencelIndex, 1);
  }
  return materials;
};

const matcharacteristic = [
  {
    Name: 'Acrylic',
    Characteristic:
      'is lightweight, soft, and warm - similar to wool but it is machine washable.',
  },
  {
    Name: 'Canvas',
    Characteristic:
      "is durable, sturdy, and heavy duty. It's great for the outdoors.",
  },
  {
    Name: 'Cashmere',
    Characteristic:
      "is lighter and softer than sheep's wool but is much warmer.",
  },
  {
    Name: 'Chiffon',
    Characteristic: 'is sheer and lightweight and normally looks translucent.',
  },
  {
    Name: 'Cotton',
    Characteristic: 'is soft, breathable, lightweight, and durable.',
  },
  {
    Name: 'Crepe',
    Characteristic: 'is usually a delicate form of wool, silk, or polyester.',
  },
  {
    Name: 'Elastane',
    Characteristic:
      "is elastic. It's blended with other fabric types to make them stretchy.",
  },
  {
    Name: 'Jersey',
    Characteristic: 'is a soft stretchy, knit fabric.',
  },
  {
    Name: 'Leather',
    Characteristic: 'is a strong, durable, and wrinkle-resistant fabric.',
  },
  {
    Name: 'Linen',
    Characteristic:
      'is breathable and naturally cool. It creases fairly easily.',
  },
  {
    Name: 'Lycra',
    Characteristic:
      "is elastic. It's blended with other fabric types to make them stretchy.",
  },
  {
    Name: 'Lyocell',
    Characteristic:
      'is soft, breathable, light and can be stretchy. This makes it ideal for sportswear.',
  },
  {
    Name: 'Mesh',
    Characteristic:
      'is usually made from polyester, nylon or spandex finely formed into small holes.',
  },
  {
    Name: 'Modal',
    Characteristic: 'is soft and strong pricier alternative to cotton.',
  },
  {
    Name: 'Nylon',
    Characteristic: 'is strong, light, and stretchy.',
  },
  {
    Name: 'Polyamide',
    Characteristic: 'is strong, light, and stretchy.',
  },
  {
    Name: 'Polyester',
    Characteristic:
      'is durable and crease resistant. It can be reasonably stretchy and may feel sweaty when the weather is hot.',
  },
  {
    Name: 'Polyurethane',
    Characteristic:
      "is elastic. It's blended with other fabric types to make them stretchy.",
  },
  {
    Name: 'Rayon',
    Characteristic: 'is lightweight, flowy, and doesn’t wrinkle easily.',
  },
  {
    Name: 'Satin',
    Characteristic:
      'is soft, shiny and slightly elastic. It drapes so may not be form-fitting.',
  },
  {
    Name: 'Silk',
    Characteristic:
      'is strong and durable but also very lightweight with a sheen. It drapes so may not be form-fitting.',
  },
  {
    Name: 'Spandex',
    Characteristic:
      "is elastic. It's blended with other fabric types to make them stretchy.",
  },
  {
    Name: 'Suede',
    Characteristic:
      'is softer and thinner than traditional leather but is still very durable.',
  },
  {
    Name: 'Tencel',
    Characteristic:
      'is soft, breathable, light and can be stretchy. This makes it ideal for sportswear.',
  },
  {
    Name: 'Velvet',
    Characteristic:
      'is soft and shiny but also has drape, making it suitable for dresses or even upholstery.',
  },
  {
    Name: 'Viscose',
    Characteristic:
      'has a similar drape and smooth feel to silk. It is lightweight and flowy.',
  },
  {
    Name: 'Wool',
    Characteristic:
      'is soft and very warm. It has a little bit of stretch to it and it can be itchy if it is unlined.',
  },
] as const;

const materials = matcharacteristic.map((material) => material.Name);
type Materials = typeof materials[number];
