import { BrandValue, brands, findBrand } from './brands';
import { categories, getCategory } from './categories';
import { getLegalSizes } from './sizes';

type Item = {
  name: string;
  brand: BrandValue;
  size: string;
};

// const htmlToText = (str: string) => str.replace(/<\/?[^>]+>/gi, ' ');

const htmlToText = (str: string): string => {
  const body = document.createElement('div');
  body.innerHTML = str;
  return body.innerText;
};

const parseEmailFunctions = {
  [brands.arket]: (body): Item[] => {
    const items: Item[] = [];
    let lines = body;
    lines = lines
      .substring(
        lines.indexOf('Total price') + 11,
        lines.indexOf('Products total')
      )
      .split('\n');
    lines = lines.reduce((lines, line) => {
      const a = line.replaceAll('|', '').trim();
      if (a !== '') {
        lines.push(a);
      }
      return lines;
    }, []);
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const test = Number(line);
      if (!isNaN(test) && test > 100) {
        items.push({
          name: lines[index + 1].trim(),
          size: lines[index + 3].trim(),
          brand: brands.arket,
        });
      }
    }
    return items;
  },
  [brands.asos]: (body): Item[] => {
    const items: Item[] = [];
    const temp = document.createElement('div');
    temp.innerHTML = body;
    // const text = temp.innerText;
    return items;
  },
  [brands.bershka]: (body): Item[] => {
    const items: Item[] = [];
    let text = htmlToText(body).trim();
    text = text.substring(
      text.lastIndexOf('Purchase summary') + 16,
      text.lastIndexOf('Total item price')
    );

    const formattedLines = text.split('£');

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

      const legalSizes = getLegalSizes(brands.bershka);

      // get size

      for (let index = 0; index < lines.length; index++) {
        const potentialSize = lines[index];
        const i = legalSizes.findIndex(
          (legalSize) => legalSize === potentialSize
        );
        if (i !== -1) {
          size = potentialSize;
        }
      }

      items.push({
        name,
        size,
        brand: brands.bershka,
      });
    });

    return items;
  },
  [brands.boohoo]: (body): Item[] => {
    const items: Item[] = [];
    let array = htmlToText(body).replace(/>/gi, '').trim();

    array = array.substring(
      array.toLowerCase().lastIndexOf('s in the bag...') + 18,
      array.toLowerCase().lastIndexOf('subtotal')
    );

    let lines = array.split(/\n/g);
    lines = lines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    let originalEmail;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('qty')) {
        if (
          line.toLowerCase().includes('qty') &&
          line.toLowerCase().includes('size') &&
          line.toLowerCase().includes('colour')
        ) {
          originalEmail = false;
        } else {
          originalEmail = true;
        }
      }
    }

    const nameStep = originalEmail ? 3 : 2;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Size:')) {
        const name = lines[i - nameStep];
        const size = originalEmail
          ? lines[i + 1]
          : lines[i]
              .toLowerCase()
              .substring(
                lines[i].toLowerCase().lastIndexOf('size:') + 5,
                lines[i].toLowerCase().lastIndexOf('[')
              )
              .replace('*', '')
              .trim();

        items.push({
          name,
          size,
          brand: brands.boohoo,
        });
      }
    }

    return items;
  },
  [brands.hm]: (body): Item[] => {
    const items: Item[] = [];
    const text = htmlToText(body).trim();
    let lines = text
      .substring(
        text.toLowerCase().lastIndexOf('price after discount') + 20,
        text.toLowerCase().lastIndexOf('products total')
      )
      .split('\n');
    lines = lines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    let originalEmail;

    if (lines.length) {
      const searchForPattern = lines[0].search(/\d{5,}\s\w+/gm) !== -1;
      if (searchForPattern) {
        originalEmail = false;
      } else {
        originalEmail = true;
      }
    }

    if (originalEmail) {
      let searchingForSymbol = true;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (searchingForSymbol) {
          if (line.includes('£')) {
            searchingForSymbol = false;
            items.push({
              name: lines[i - 4],
              size: lines[i - 3],
              brand: brands.hm,
            });
          }
        } else {
          if (!line.includes('£')) {
            searchingForSymbol = true;
          }
        }
      }
    } else {
      for (let i = 0; i < lines.length; i++) {
        const item = lines[i].split(' ');
        const legalSizes = getLegalSizes(brands.hm);
        for (let j = 0; j < item.length; j++) {
          const text = item[j];
          const index = legalSizes.indexOf(text);
          if (index !== -1) {
            items.push({
              name: item.slice(1, j).toString().replace(/,/g, ' '),
              size: text,
              brand: brands.hm,
            });
          }
        }
      }
    }

    return items;
  },
  [brands.houseOfCB]: (body): Item[] => {
    const items: Item[] = [];
    const text = htmlToText(body);
    const formattedLines = text
      .substring(text.lastIndexOf('Qty') + 5, text.lastIndexOf('Returns'))
      .replace(/\r/g, '')
      .split(/\n/g);
    let lines = [];
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.includes('Size:')) {
        const name = `${lines[index - 2]} ${lines[index - 1]}`.trim();
        itemBlocks.push({
          name,
          size: line
            .substring(line.indexOf(':') + 1)
            .replace('&nbsp;', '')
            .trim(),
        });
      }
    }

    itemBlocks.forEach(({ name, size }) => {
      items.push({
        name,
        size,
        brand: brands.houseOfCB,
      });
    });
    return items;
  },
  [brands.iSawItFirst]: (body): Item[] => {
    const items: Item[] = [];
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
      items.push({
        name,
        size,
        brand: brands.iSawItFirst,
      });
    });

    return items;
  },
  [brands.mango]: (body): Item[] => {
    const items: Item[] = [];
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
          brand: brands.mango,
        });
      }
    }
    return items;
  },
  [brands.massimoDutti]: (body): Item[] => {
    const items: Item[] = [];
    let text;
    text = htmlToText(body).trim();
    text = text.substring(
      text.lastIndexOf('Estimated delivery date') + 23,
      text.lastIndexOf('Product total')
    );

    let lines = [];
    const formattedLines = text.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.includes('Size:')) {
        // we found the size
        itemBlocks.push({
          name: lines[index - 1].replaceAll('*', '').trim(),
          size: line.substring(line.indexOf(':') + 1).trim(),
        });
      }
    }

    itemBlocks.forEach(({ name, size }) => {
      items.push({
        name,
        size,
        brand: brands.massimoDutti,
      });
    });

    return items;
  },
  [brands.missguided]: (body): Item[] => {
    const items: Item[] = [];
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
          brand: brands.missguided,
        });
      }
    }
    return items;
  },
  [brands.monki]: (body): Item[] => {
    const items: Item[] = [];
    let text;
    text = htmlToText(body).trim();
    const columns = text.toLowerCase().includes('discount') ? 8 : 7;
    text = text.substring(
      text.lastIndexOf('Total price') + 11,
      text.lastIndexOf('Products total')
    );
    let lines = [];
    const formattedLines = text.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];
    while (lines.length) {
      itemBlocks.push(lines.splice(0, columns));
    }

    itemBlocks.forEach((itemBlock) => {
      let name = null;
      let size = null;
      // get name

      for (let index = 0; index < itemBlock.length; index++) {
        const potentialItemName = itemBlock[index];
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

      const legalSizes = getLegalSizes(brands.monki);

      for (let index = 0; index < itemBlock.length; index++) {
        const potentialSize = itemBlock[index];
        const i = legalSizes.findIndex(
          (legalSize) => legalSize === potentialSize
        );
        if (i !== -1) {
          size = potentialSize;
        }
      }

      items.push({
        name,
        size,
        brand: brands.monki,
      });
    });

    return items;
  },
  [brands.ms]: (body): Item[] => {
    const items: Item[] = [];
    let text;
    text = htmlToText(body).trim();
    text = text.substring(
      text.lastIndexOf('Order details') + 13,
      text.lastIndexOf('Payment details')
    );

    let lines = [];
    const formattedLines = text.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.includes('Size:')) {
        // we found the size
        const name = lines[index - 2]?.replace(/\*/gi, '').trim() || '';
        itemBlocks.push({
          name,
          size: line.substring(line.indexOf(':') + 1).trim(),
        });
      }
    }

    itemBlocks.forEach(({ name, size }) => {
      items.push({
        name,
        size,
        brand: brands.ms,
      });
    });

    return items;
  },
  [brands.nakd]: (body): Item[] => {
    const items: Item[] = [];
    let text = htmlToText(body).trim();
    text = text.substring(
      text.lastIndexOf('My Order'),
      text.lastIndexOf('Order overview')
    );
    const formattedLines = text.split('Quantity:');

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
      items.push({
        name,
        size,
        brand: brands.nakd,
      });
    });
    return items;
  },
  [brands.next]: (body): Item[] => {
    const items = [];
    let lines = body;
    lines = lines
      .substring(lines.indexOf('Description'), lines.indexOf('Total'))
      .split('\n');
    lines = lines.reduce((lines, line) => {
      const a = line.replaceAll('|', '').trim();
      if (a !== '') {
        lines.push(a);
      }
      return lines;
    }, []);

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.toLowerCase().includes('price')) {
        const name = line.replace('Price', '').trim();
        const brand = findBrand(name) || brands.next;
        const legalSizes = getLegalSizes(brand);
        items.push({
          name,
          size: lines[index + 2].trim(),
          brand,
        });
      }
    }
    return items;
  },
  [brands.otherStories]: (body): Item[] => {
    const items: Item[] = [];
    const rawText = htmlToText(body).trim();
    let rawLines = rawText
      .substring(
        rawText.lastIndexOf('Total price') + 11,
        rawText.lastIndexOf('Products total')
      )
      .split(/\n/g);

    rawLines = rawLines.reduce((rawLines, line) => {
      if (line.trim() !== '') {
        rawLines.push(line.trim());
      }
      return rawLines;
    }, []);

    let originalEmail;

    if (rawLines.length) {
      const searchForPattern = rawLines[0].search(/\d{5,}\s\w+/gm) !== -1;
      if (searchForPattern) {
        originalEmail = false;
      } else {
        originalEmail = true;
      }
    }

    if (originalEmail) {
      let searchingForSymbol = true;

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if (searchingForSymbol) {
          if (line.includes('£')) {
            searchingForSymbol = false;
            items.push({
              name: rawLines[i - 4],
              size: rawLines[i - 3],
              brand: brands.otherStories,
            });
          }
        } else {
          if (!line.includes('£')) {
            searchingForSymbol = true;
          }
        }
      }
    } else {
      for (let i = 0; i < rawLines.length; i++) {
        const item = rawLines[i].split(' ');
        const legalSizes = getLegalSizes(brands.otherStories);
        for (let j = 0; j < item.length; j++) {
          const text = item[j];
          const index = legalSizes.indexOf(text);
          if (index !== -1) {
            items.push({
              name: item.slice(1, j).toString().replace(/,/g, ' '),
              size: text,
              brand: brands.otherStories,
            });
          }
        }
      }
    }

    return items;
  },
  [brands.plt]: (body): Item[] => {
    const items: Item[] = [];
    const startIndex =
      body.lastIndexOf('Price') !== -1
        ? body.lastIndexOf('Price') + 5
        : body.indexOf('Product   Information Price') + 27;
    let text = htmlToText(body);

    text = body.substring(startIndex, body.lastIndexOf('Subtotal'));
    let lines = text.split(/\n/g);
    lines = lines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];

    // while (lines.length) {
    //   console.log(lines);
    //   itemBlocks.push(lines.slice(0, 5));
    // }

    itemBlocks.forEach((itemBlock) => {
      let size;
      if (itemBlock[1].includes('Size: ')) {
        size = itemBlock[1].replace(/Size: /, '').trim();
      }
      const name = itemBlock[0];
      items.push({
        name,
        size,
        brand: brands.plt,
      });
    });

    return items;
  },
  [brands.pullBear]: (body): Item[] => {
    const items: Item[] = [];
    let formattedLines = htmlToText(body).replace(/\[(.*?)\]/gi, ' ');
    formattedLines = formattedLines.substring(
      formattedLines.lastIndexOf('DELIVERY ADDRESS:') + 17,
      formattedLines.lastIndexOf('PRODUCT TOTAL')
    );
    let lines = formattedLines.split(/\n/g).reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const startIndex = lines.findIndex((line) => getCategory(line));
    lines = lines.filter((_, index) => index >= startIndex);
    // chunk into 5's
    const itemBlocks = [];
    while (lines.length) {
      itemBlocks.push(lines.splice(0, 5));
    }

    itemBlocks.forEach((itemBlock) => {
      const name = itemBlock[0];
      let size = null;

      const legalSizes = getLegalSizes(brands.pullBear);

      // get size

      for (let index = 0; index < itemBlock.length; index++) {
        const potentialSize = itemBlock[index];
        const i = legalSizes.findIndex(
          (legalSize) => legalSize === potentialSize
        );
        if (i !== -1) {
          size = potentialSize;
        }
      }

      items.push({
        name,
        size,
        brand: brands.pullBear,
      });
    });

    return items;
  },
  [brands.stradivarius]: (body): Item[] => {
    const items: Item[] = [];
    let text;
    text = htmlToText(body).trim();
    text = text.substring(
      text.lastIndexOf('Date of order') + 13,
      text.lastIndexOf('Payment method')
    );

    let lines = [];
    const formattedLines = text.split(/\n/g);
    lines = formattedLines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    const itemBlocks = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.includes(' | ')) {
        // we found the size
        itemBlocks.push({
          name: lines[index - 3].trim(),
          size: line.substring(0, line.indexOf('|')).trim(),
        });
      }
    }

    itemBlocks.forEach(({ name, size }) => {
      items.push({
        name,
        size,
        brand: brands.stradivarius,
      });
    });

    return items;
  },
  [brands.uniqlo]: (body): Item[] => {
    const items: Item[] = [];
    let text = htmlToText(body).trim();
    text = text.substring(
      text.lastIndexOf('Order Number') + 12,
      text.lastIndexOf('Order Details:')
    );

    const formattedLines = text.split('Item No:');

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
      items.push({
        name,
        size,
        brand: brands.uniqlo,
      });
    });

    return items;
  },
  [brands.zara]: (body): Item[] => {
    const items: Item[] = [];
    const legalSizes = getLegalSizes(brands.zara);
    const text = body;
    let lines = text
      .substring(text.lastIndexOf('Products'), text.lastIndexOf('Payment'))
      .split('\n');

    lines = lines.reduce((lines, line) => {
      if (line.trim() !== '') {
        lines.push(line.trim());
      }
      return lines;
    }, []);

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const i = legalSizes.findIndex((legalSize) => legalSize === line);
      if (i !== -1) {
        items.push({
          name: lines[index + 1].trim(),
          size: line,
          brand: brands.zara,
        });
      }
    }
    return items;
  },
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
