import {
  findBrand,
  getCategory,
  getMaterialsFromString,
  validAsosBrands,
} from '@efitter-hub/efiter-lib';
import { assert } from 'console';
import * as puppeteer from 'puppeteer';
import asosUrls from './urls/asos.json';
import bershkaUrls from './urls/bershka.json';
import hmUrls from './urls/hm.json';
import houseofcbUrls from './urls/houseOfCB.json';
import mangoUrls from './urls/mango.json';
import stradivariusUrls from './urls/stradivarius.json';
import uniqloUrls from './urls/uniqlo.json';
import zaraUrls from './urls/zara.json';

const pageValidator = (item, isValid) => {
  if (!(isValid === item.isPageValid)) {
    console.log(
      `[${item.url}] || IsPageValid: Expected ${item.isPageValid}, but received ${isValid}`
    );
  }
};
const itemValidator = (item, response) => {
  const { sizeExample, materials, product_name } = response;

  if (!(product_name === item.itemName)) {
    console.log(
      `[${item.url}] || Product Name: Expected ${item.itemName}, but received ${product_name}`
    );
  }
  if (!(sizeExample === item.exampleSize)) {
    console.log(
      `[${item.url}] || sizeExample: Expected ${item.exampleSize}, but received ${sizeExample}`
    );
  }
  if (
    !(
      getMaterialsFromString(materials).toString() === item.materials.toString()
    )
  ) {
    console.log(
      `[${item.url}] || materials: Expected ${
        item.materials
      }, but received ${getMaterialsFromString(materials)}`
    );
  }
  if (!(getCategory(product_name) === item.category)) {
    console.log(
      `[${item.url}] || category: Expected ${
        item.category
      }, but received ${getCategory(product_name)}`
    );
  }
};
const validateItemNames = (itemNames, brandCheck = false) => {
  let brandCheckList = [];
  const items = itemNames.filter((itemName) => getCategory(itemName) === '');
  if (brandCheck) {
    brandCheckList = itemNames.filter((itemName) => !findBrand(itemName));
  }
  return [...items, ...brandCheckList];
};

console.log('Hello World!');
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
    devtools: true,
    defaultViewport: null,
  });

  parseAsos(browser);

  parseBershka(browser);

  parseHm(browser);

  parseHouseOfCB(browser);

  parseMango(browser);

  parseStradivarius(browser);

  parseUniqlo(browser);

  parseZara(browser);

  newArrivals(browser);
})();

const parseZara = (browser: puppeteer.Browser) => {
  zaraUrls.forEach(async (item) => {
    const page = await browser.newPage();
    await (async () => {
      console.log('parsing:', item.url);
      await page.goto(item.url, {
        waitUntil: 'networkidle0',
      });
      await page.waitForTimeout(500);
      // Check Page
      await page.exposeFunction('getCategory', getCategory);

      const isPageValid = await page.evaluate((): boolean => {
        const element = document.querySelector('.product-detail-info');
        if (typeof element != 'undefined' && element != null) {
          const womensSection = [
            ...(document.querySelectorAll(
              'li.layout-categories-category--level-1'
            ) as unknown as HTMLElement[]),
          ].filter(
            (MenuElement) =>
              MenuElement.querySelector('a').innerText.toLowerCase() === 'woman'
          )[0];
          const product_name = document
            .querySelector('h1.product-detail-info__header-name')
            .textContent.trim();
          const category = (window as any).getCategory(product_name);
          if (!womensSection.className.includes('is-blurred') && category) {
            return true;
          }
        }
        return false;
      });
      pageValidator(item, isPageValid);

      if (isPageValid) {
        const { product_name, sizeExample, materials } = await page.evaluate(
          () => {
            const product_name = document
              .querySelector('h1.product-detail-info__header-name')
              .textContent.trim();
            const sizeExample = document
              .querySelector('.product-detail-size-info')
              .textContent.replace('Similar products', '')
              .trim();
            const materials = (
              document.querySelector(
                '.product-detail-extra-detail'
              ) as HTMLElement | null
            ).innerText;

            return { product_name, sizeExample, materials };
          }
        );

        itemValidator(item, { product_name, sizeExample, materials });
      }
      page.close();
    })();
  });
};

const parseUniqlo = (browser: puppeteer.Browser) => {
  uniqloUrls.forEach(async (item) => {
    const page = await browser.newPage();
    await (async () => {
      console.log('parsing:', item.url);
      await page.goto(item.url, {
        waitUntil: 'networkidle0',
      });
      await page.waitForTimeout(500);
      // Check Page
      await page.exposeFunction('getCategory', getCategory);

      const isPageValid = await page.evaluate((): boolean => {
        const url = document.location.href;
        if (url.includes('/product/')) {
          const element = document.querySelector('ul.breadCrumb__list');
          if (element.textContent.toLowerCase().includes('women')) {
            return true;
          }
        }
        return false;
      });
      pageValidator(item, isPageValid);

      if (isPageValid) {
        const { product_name, sizeExample, materials } = await page.evaluate(
          () => {
            const product_name = document
              .querySelector('h1, pdp__title')
              .textContent.trim();
            const sizeExample = document
              .querySelectorAll('.swatchBox--size .swatch--size')[0]
              .textContent.replace(/\s/g, '');
            const materials = document.querySelector(
              '.deliverySection__text'
            ).textContent;

            return { product_name, sizeExample, materials };
          }
        );

        itemValidator(item, { product_name, sizeExample, materials });
      }
      page.close();
    })();
  });
};

const parseMango = (browser: puppeteer.Browser) => {
  mangoUrls.forEach(async (item) => {
    const page = await browser.newPage();
    await (async () => {
      console.log('parsing:', item.url);
      await page.goto(item.url, {
        waitUntil: 'networkidle0',
      });
      await page.waitForTimeout(500);
      // Check Page
      await page.exposeFunction('getCategory', getCategory);

      const isPageValid = await page.evaluate((): boolean => {
        const url = document.location.href;
        if (url.includes('/women/') || url.includes('/plus-size/')) {
          const element = document.querySelector('#productDetailOption');
          if (typeof element != 'undefined' && element != null) {
            return true;
          }
        }
        return false;
      });
      pageValidator(item, isPageValid);

      if (isPageValid) {
        const { product_name, sizeExample, materials } = await page.evaluate(
          () => {
            let product_name, sizeExample, materials;

            // Product Name
            product_name = product_name = document
              .querySelector('.product-name')
              .textContent.trim();

            // Size example
            sizeExample = document.querySelector('.sizes .single-size')
              ? document.querySelector('.sizes .single-size').textContent
              : document.querySelectorAll(
                  '.sizes .selector .selector-list span'
                )[0].textContent;

            sizeExample = sizeExample.split('-')[0].trim();

            // Materials
            document
              .querySelectorAll('.product-info-text')
              .forEach((node, i) => {
                if (node.textContent.toLowerCase().includes('composition:')) {
                  materials =
                    document.querySelectorAll('.product-info-text')[i]
                      .textContent;
                }
              });

            return { product_name, sizeExample, materials };
          }
        );

        itemValidator(item, { product_name, sizeExample, materials });
      }
      page.close();
    })();
  });
};

const parseHm = (browser: puppeteer.Browser) => {
  hmUrls.forEach(async (item) => {
    const page = await browser.newPage();
    await (async () => {
      console.log('parsing:', item.url);
      await page.goto(item.url, {
        waitUntil: 'networkidle0',
      });
      await page.waitForTimeout(500);
      // Check Page
      await page.exposeFunction('getCategory', getCategory);

      const isPageValid = await page.evaluate((): boolean => {
        const element = document.querySelector('.product');
        if (typeof element != 'undefined' && element != null) {
          const product_name = document.querySelector('h1')?.textContent || '';
          const category = (window as any).getCategory(product_name);
          if (category) {
            const breadcrumbs = (
              (document.querySelector('nav ol') as HTMLElement | null)
                ?.innerText || ''
            ).toLowerCase();
            const breadcrumbArray = breadcrumbs.split('/');
            if (breadcrumbArray.length < 3) {
              return true;
            } else {
              if (
                breadcrumbs.includes('women') ||
                breadcrumbs.includes('divided')
              ) {
                return true;
              }
            }
          }
        }
        return false;
      });
      pageValidator(item, isPageValid);

      if (isPageValid) {
        const { product_name, sizeExample, materials } = await page.evaluate(
          () => {
            const product_name = document.querySelector('h1').textContent;
            const sizeExample = document.querySelectorAll(
              '.picker-option .option .value'
            )[1].textContent;

            const materials = document.querySelector(
              '.ProductDescription-module--productDescription__2mqXe'
            ).textContent;

            return { product_name, sizeExample, materials, isPageValid: true };
          }
        );

        itemValidator(item, { product_name, sizeExample, materials });
      }
      page.close();
    })();
  });
};

const parseAsos = (browser: puppeteer.Browser) => {
  asosUrls.forEach(async (item) => {
    const page = await browser.newPage();
    await (async () => {
      console.log('parsing:', item.url);
      await page.goto(item.url, {
        waitUntil: 'networkidle0',
      });
      await page.waitForTimeout(500);
      // Check Page
      const isPageValid = await page.evaluate((validAsosBrands): boolean => {
        const element = document.querySelector('#product-details');
        if (typeof element != 'undefined' && element != null) {
          // product page
          const breadcrumbHasWomen = (
            document.querySelector(
              "[aria-label='breadcrumbs']"
            ) as HTMLElement | null
          ).innerText
            .toLowerCase()
            .includes('women');
          const pageSectionStyles =
            document.querySelector('#women-floor').className ===
            'TO7hyVB _3B0kHbC _3AH1eDT Tar7aO0';
          if (pageSectionStyles || breadcrumbHasWomen) {
            // womans clothing
            const brand = (
              document.querySelectorAll(
                'div.product-description a'
              )[1] as HTMLElement | null
            ).innerText;
            // brand
            const index = validAsosBrands.findIndex((value) =>
              brand.toLowerCase().includes(value.toLowerCase())
            );
            if (index >= 0) return true;
          }
        }
        return false;
      }, validAsosBrands);
      pageValidator(item, isPageValid);

      if (isPageValid) {
        const { product_name, sizeExample, materials } = await page.evaluate(
          () => {
            const product_name = document
              .querySelector('h1')
              .textContent.trim();
            const sizeExample = document
              .querySelectorAll(
                '.colour-size-select [data-id="sizeSelect"] option'
              )[1]
              .textContent.replaceAll('UK', '')
              .replaceAll('EU', '')
              .trim();
            const materials = document.querySelector('.about-me').textContent; // about me section has the material info
            let isPageValid;

            return { product_name, sizeExample, materials, isPageValid };
          }
        );

        itemValidator(item, { product_name, sizeExample, materials });
      }
      page.close();
    })();
  });
};

const parseBershka = (browser: puppeteer.Browser) => {
  bershkaUrls.forEach(async (item) => {
    const page = await browser.newPage();
    await (async () => {
      console.log('parsing:', item.url);
      await page.goto(item.url, {
        waitUntil: 'networkidle0',
      });
      await page.waitForTimeout(500);
      // Check Page
      await page.exposeFunction('getCategory', getCategory);

      const isPageValid = await page.evaluate((): boolean => {
        const element = document.querySelector('h1.product-title');
        if (typeof element != 'undefined' && element != null) {
          const product_name =
            document.querySelector('h1.product-title').textContent;
          const category = (window as any).getCategory(product_name);
          if (category) {
            return true;
          }
        }
        return false;
      });
      pageValidator(item, isPageValid);

      if (isPageValid) {
        const { product_name, sizeExample, materials } = await page.evaluate(
          () => {
            const product_name = document
              .querySelector('h1.product-title')
              .textContent.trim();
            const sizeExample =
              document
                .querySelector('.sizes-list-detail ul li')
                .textContent.trim() || 'XS';
            const materials = document.querySelector(
              '.product-compositions'
            ).textContent;

            return { product_name, sizeExample, materials };
          }
        );

        itemValidator(item, { product_name, sizeExample, materials });
      }
      page.close();
    })();
  });
};

const parseHouseOfCB = (browser: puppeteer.Browser) => {
  houseofcbUrls.forEach(async (item) => {
    const page = await browser.newPage();
    await (async () => {
      console.log('parsing:', item.url);
      await page.goto(item.url, {
        waitUntil: 'networkidle0',
      });
      await page.waitForTimeout(500);
      // Check Page
      await page.exposeFunction('getCategory', getCategory);

      const isPageValid = await page.evaluate((): boolean => {
        const element = document.querySelector('.product_description_text');
        const product_name =
          document.querySelector('h1.main-title')?.textContent || '';
        const category = (window as any).getCategory(product_name);
        if (typeof element != 'undefined' && element != null && category) {
          return true;
        }
        return false;
      });
      pageValidator(item, isPageValid);

      if (isPageValid) {
        const { product_name, sizeExample, materials } = await page.evaluate(
          () => {
            const product_name =
              document.querySelector('h1.main-title').textContent;

            const size = document.querySelector(
              '#product-size ul li a'
            ).textContent;

            const sizeExample = size.split('-')[0].trim();

            let materials: string;

            document
              .querySelectorAll('.product_description_text div')
              .forEach((node, i) => {
                if (
                  node.textContent.toLowerCase().includes('materials:') ||
                  node.textContent.toLowerCase().includes('material:')
                ) {
                  materials = document.querySelectorAll(
                    '.product_description_text div'
                  )[i].textContent;
                }
              });

            return { product_name, sizeExample, materials };
          }
        );

        itemValidator(item, { product_name, sizeExample, materials });
      }
      page.close();
    })();
  });
};

const parseStradivarius = (browser: puppeteer.Browser) => {
  stradivariusUrls.forEach(async (item) => {
    const page = await browser.newPage();
    await (async () => {
      console.log('parsing:', item.url);
      await page.goto(item.url, {
        waitUntil: 'networkidle0',
      });
      await page.waitForTimeout(500);
      // Check Page
      await page.exposeFunction('getCategory', getCategory);

      const isPageValid = await page.evaluate(async (): Promise<boolean> => {
        const element = document.querySelector('h1.product-name-title');
        if (typeof element !== 'undefined' && element !== null) {
          const product_name = element.textContent;
          const category = (window as any).getCategory(product_name);
          if (category) {
            return true;
          }
        }
        return false;
      });
      pageValidator(item, isPageValid);

      if (isPageValid) {
        const { product_name, sizeExample, materials } = await page.evaluate(
          async () => {
            const elementAppear = (
              selector: string,
              cyclesCount?: number
            ): Promise<Element> => {
              let cycles = cyclesCount || 0;
              return new Promise((resolve) => {
                const id = setInterval(function () {
                  cycles++;
                  const element = document.querySelector(selector);

                  if (element || cycles > 100) {
                    clearInterval(id);
                    resolve(element);
                  }
                }, 100);
              });
            };
            const product_name = document.querySelector(
              'h1.product-name-title'
            ).textContent;

            const links = document.querySelectorAll('div.bottom-elements a');

            for (let i = 0; i < links.length; i++) {
              const link = links[i] as HTMLElement;
              if (link.innerText.toLowerCase().includes('composition')) {
                link.click();
              }
            }

            await elementAppear('.sidebar-composition-content');
            const materials = (
              document.querySelector(
                '.sidebar-composition-content'
              ) as HTMLElement
            ).innerText;

            const sizeExample = document.querySelectorAll(
              '.data-item-sizes .item-grid-size'
            )[1].textContent;

            return { product_name, sizeExample, materials };
          }
        );

        itemValidator(item, { product_name, sizeExample, materials });
      }
      page.close();
    })();
  });
};

const newArrivals = (browser: puppeteer.Browser) => {
  // HM
  (async () => {
    const page = await browser.newPage();
    await page.goto(
      'https://www2.hm.com/en_gb/ladies/new-arrivals/view-all.html'
    );
    let itemNames = await page.evaluate(() => {
      const result = [];
      const nodeArray = document.querySelectorAll('.item-details a.link');
      nodeArray.forEach((node) => result.push((node as HTMLElement).innerText));
      return result;
    });
    assert(itemNames.length > 0, 'No items found on H&M new arrivals page');
    itemNames = validateItemNames(itemNames);
    if (itemNames.length !== 0) console.log('H&M list:', itemNames);
    page.close();
  })();

  // Mango
  (async () => {
    const page = await browser.newPage();
    await page.goto(
      'https://shop.mango.com/gb/women/featured/new-now_d71927648'
    );
    let itemNames = await page.evaluate(() => {
      const result = [];
      const nodeArray = document.querySelectorAll('span.product-name');
      nodeArray.forEach((node) => result.push((node as HTMLElement).innerText));
      return result;
    });
    assert(itemNames.length > 0, 'No items found on Mango new arrivals page');
    itemNames = validateItemNames(itemNames);
    if (itemNames.length !== 0) console.log('Mango list:', itemNames);
    page.close();
  })();

  // Uniqlo
  (async () => {
    const page = await browser.newPage();
    await page.goto('https://www.uniqlo.com/uk/en/women/featured/new-arrivals');
    let itemNames = await page.evaluate(() => {
      const result = [];
      const nodeArray = document.querySelectorAll('span.productTile__heading');
      nodeArray.forEach((node) => result.push((node as HTMLElement).innerText));
      return result;
    });
    assert(itemNames.length > 0, 'No items found on Uniqlo new arrivals page');
    itemNames = validateItemNames(itemNames);
    if (itemNames.length !== 0) console.log('Uniqlo list:', itemNames);
    page.close();
  })();

  // Zara
  (async () => {
    const page = await browser.newPage();
    await page.goto(
      'https://www.zara.com/uk/en/woman-new-in-l1180.html?v1=2026572'
    );
    let itemNames = await page.evaluate(() => {
      const result = [];
      const nodeArray = document.querySelectorAll(
        '.product-grid-product-info__main-info a.product-link._item.product-grid-product-info__name.link'
      );
      nodeArray.forEach((node) => result.push((node as HTMLElement).innerText));
      return result;
    });
    assert(itemNames.length > 0, 'No items found on Zara new arrivals page');
    itemNames = validateItemNames(itemNames);
    if (itemNames.length !== 0) console.log('Zara list:', itemNames);
    page.close();
  })();

  // Asos
  (async () => {
    const page = await browser.newPage();
    await page.goto(
      'https://www.asos.com/women/new-in/new-in-clothing/cat/?cid=2623&nlid=ww|new+in|new+products|clothing'
    );
    let itemNames = await page.evaluate(() => {
      const result = [];
      const nodeArray = document.querySelectorAll(
        'article[data-auto-id="productTile"] h2'
      );
      nodeArray.forEach((node) => result.push((node as HTMLElement).innerText));
      return result;
    });
    assert(itemNames.length > 0, 'No items found on Zara new arrivals page');
    itemNames = validateItemNames(itemNames, true);
    if (itemNames.length !== 0) {
      console.log(
        'Please remember that with Asos, we have to check the Brand as well'
      );
      console.log('ASOS list:', itemNames);
      console.log(
        'Please remember that with Asos, we have to check the Brand as well'
      );
    }
    page.close();
  })();

  // House of CB
  (async () => {
    const page = await browser.newPage();
    await page.goto('https://www.houseofcb.com/new-arrivals.html');
    let itemNames = await page.evaluate(() => {
      const result = [];
      const nodeArray = document.querySelectorAll(
        '.category-products li div a.product-title'
      );
      nodeArray.forEach((node) => result.push((node as HTMLElement).innerText));
      return result;
    });
    assert(
      itemNames.length > 0,
      'No items found on House of CB new arrivals page'
    );
    itemNames = validateItemNames(itemNames);
    if (itemNames.length !== 0) console.log('House of CB list:', itemNames);
    page.close();
  })();

  // Bershka
  (async () => {
    const brand = 'bershka';
    const page = await browser.newPage();
    await page.goto('https://www.bershka.com/gb/women/new-c1010378020.html');
    let itemNames = await page.evaluate(() => {
      const result = [];
      const nodeArray = document.querySelectorAll('.product-text');
      nodeArray.forEach((node) => result.push((node as HTMLElement).innerText));
      return result;
    });
    assert(
      itemNames.length > 0,
      `No items found on ${brand} new arrivals page`
    );
    itemNames = validateItemNames(itemNames);
    if (itemNames.length !== 0) console.log(`${brand} list:`, itemNames);
    page.close();
  })();
};
