/**
 * email from made up brand 
 *  false, []
 * 
 * email from multi-brand stores
 *  missing bra
 */

export const brands = {
  asos: "ASOS",
  bershka: "Bershka",
  boohoo: "Boohoo",
  hm: "H&M",
  iSawItFirst: "I Saw It First",
  mango: "Mango",
  missguided: "Missguided",
  monki: "Monki",
  nakd: "NA-KD",
  next: "Next",
  otherStories: "OtherStories",
  plt: "PrettyLittleThing",
  pullBear: "Pull&Bear",
  uniqlo: "Uniqlo",
  zara: "Zara",
  stradivarius: "Stradivarius",
  massimoDutti: "Massimo Dutti",
  houseOfCB: "House of CB",
  ms: "M&S",
}

export const emailValidator = (messageBody, subject) => {
  const brandName = findBrandName(messageBody, subject);
  const isValidSubjectLine = !!brandName;

  return {
    isValidSubjectLine,
    items: []
  };
}

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
}