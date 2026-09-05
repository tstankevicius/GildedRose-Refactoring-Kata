export class Item {
  name: string;
  sellIn: number;
  quality: number;

  constructor(name, sellIn, quality) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

const AGED_BRIE = 'Aged Brie';
const BACKSTAGE_PASS = 'Backstage passes to a TAFKAL80ETC concert';
const SULFURAS = 'Sulfuras, Hand of Ragnaros';
const MINIMUM_QUALITY = 0;
const MAXIMUM_QUALITY = 50;

export class GildedRose {
  items: Array<Item>;

  constructor(items = [] as Array<Item>) {
    this.items = items;
  }

  updateQuality(): Array<Item> {
    for (const item of this.items) {
      this.updateItem(item);
    }

    return this.items;
  }

  private updateItem(item: Item): void {
    if (item.name === SULFURAS) {
      return;
    }

    if (item.name === AGED_BRIE) {
      this.updateAgedBrieQuality(item);
    } else if (item.name === BACKSTAGE_PASS) {
      this.updateBackstagePassQuality(item);
    } else {
      this.updateOrdinaryItemQuality(item);
    }

    item.sellIn -= 1;
  }

  private updateOrdinaryItemQuality(item: Item): void {
    const degradation = item.sellIn <= 0 ? 2 : 1;
    this.adjustQuality(item, -degradation);
  }

  private updateAgedBrieQuality(item: Item): void {
    const increase = item.sellIn <= 0 ? 2 : 1;
    this.adjustQuality(item, increase);
  }

  private updateBackstagePassQuality(item: Item): void {
    if (item.sellIn <= 0) {
      item.quality = MINIMUM_QUALITY;
      return;
    }

    if (item.sellIn <= 5) {
      this.adjustQuality(item, 3);
      return;
    }

    if (item.sellIn <= 10) {
      this.adjustQuality(item, 2);
      return;
    }

    this.adjustQuality(item, 1);
  }

  private adjustQuality(item: Item, delta: number): void {
    const adjustedQuality = item.quality + delta;

    if (adjustedQuality < MINIMUM_QUALITY) {
      item.quality = MINIMUM_QUALITY;
      return;
    }

    if (adjustedQuality > MAXIMUM_QUALITY) {
      item.quality = MAXIMUM_QUALITY;
      return;
    }

    item.quality = adjustedQuality;
  }
}
