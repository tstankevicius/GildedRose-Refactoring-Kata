import { GildedRose, Item } from '@/gilded-rose';

const AGED_BRIE = 'Aged Brie';
const BACKSTAGE_PASS = 'Backstage passes to a TAFKAL80ETC concert';
const CONJURED_ELIXIR = 'Conjured Elixir of the Mongoose';
const CONJURED_MANA_CAKE = 'Conjured Mana Cake';
const ORDINARY_ITEM = 'Ordinary Item';
const SULFURAS = 'Sulfuras, Hand of Ragnaros';

interface UpdateCase {
  description: string;
  sellIn: number;
  quality: number;
  expectedSellIn: number;
  expectedQuality: number;
}

function expectUpdatedItem(itemName: string, testCase: UpdateCase): void {
  const { sellIn, quality, expectedSellIn, expectedQuality } = testCase;
  const [updatedItem] = new GildedRose([
    new Item(itemName, sellIn, quality),
  ]).updateQuality();

  expect(updatedItem).toEqual(
    new Item(itemName, expectedSellIn, expectedQuality),
  );
}

describe('Gilded Rose', () => {
  describe('ordinary items', () => {
    const cases: UpdateCase[] = [
      {
        description: 'decrease in quality by one before the sell-by date',
        sellIn: 5,
        quality: 10,
        expectedSellIn: 4,
        expectedQuality: 9,
      },
      {
        description: 'decrease in quality by two once the sell-by date passes',
        sellIn: 0,
        quality: 10,
        expectedSellIn: -1,
        expectedQuality: 8,
      },
      {
        description: 'never have negative quality before the sell-by date',
        sellIn: 5,
        quality: 0,
        expectedSellIn: 4,
        expectedQuality: 0,
      },
      {
        description: 'never have negative quality after the sell-by date',
        sellIn: 0,
        quality: 0,
        expectedSellIn: -1,
        expectedQuality: 0,
      },
    ];

    it.each(cases)('$description', (testCase) => {
      expectUpdatedItem(ORDINARY_ITEM, testCase);
    });
  });

  describe('Aged Brie', () => {
    const cases: UpdateCase[] = [
      {
        description: 'increases in quality by one before the sell-by date',
        sellIn: 1,
        quality: 10,
        expectedSellIn: 0,
        expectedQuality: 11,
      },
      {
        description: 'increases in quality by two once the sell-by date passes',
        sellIn: 0,
        quality: 10,
        expectedSellIn: -1,
        expectedQuality: 12,
      },
      {
        description: 'does not increase above quality 50',
        sellIn: 1,
        quality: 50,
        expectedSellIn: 0,
        expectedQuality: 50,
      },
      {
        description: 'stops at quality 50 after the sell-by date',
        sellIn: 0,
        quality: 49,
        expectedSellIn: -1,
        expectedQuality: 50,
      },
    ];

    it.each(cases)('$description', (testCase) => {
      expectUpdatedItem(AGED_BRIE, testCase);
    });
  });

  describe('Backstage passes', () => {
    const cases: UpdateCase[] = [
      {
        description: 'increase in quality by one with more than 10 days left',
        sellIn: 11,
        quality: 20,
        expectedSellIn: 10,
        expectedQuality: 21,
      },
      {
        description: 'increase in quality by two with exactly 10 days left',
        sellIn: 10,
        quality: 20,
        expectedSellIn: 9,
        expectedQuality: 22,
      },
      {
        description: 'increase in quality by two with 6 days left',
        sellIn: 6,
        quality: 20,
        expectedSellIn: 5,
        expectedQuality: 22,
      },
      {
        description: 'increase in quality by three with exactly 5 days left',
        sellIn: 5,
        quality: 20,
        expectedSellIn: 4,
        expectedQuality: 23,
      },
      {
        description: 'increase in quality by three with exactly 1 day left',
        sellIn: 1,
        quality: 20,
        expectedSellIn: 0,
        expectedQuality: 23,
      },
      {
        description: 'drop to quality 0 after the concert',
        sellIn: 0,
        quality: 20,
        expectedSellIn: -1,
        expectedQuality: 0,
      },
      {
        description: 'stop at quality 50 when an increase would exceed it',
        sellIn: 5,
        quality: 49,
        expectedSellIn: 4,
        expectedQuality: 50,
      },
      {
        description: 'remain at quality 50 before the concert',
        sellIn: 10,
        quality: 50,
        expectedSellIn: 9,
        expectedQuality: 50,
      },
    ];

    it.each(cases)('$description', (testCase) => {
      expectUpdatedItem(BACKSTAGE_PASS, testCase);
    });
  });

  describe('Conjured items', () => {
    const cases: Array<UpdateCase & { itemName: string }> = [
      {
        description: 'decrease in quality by two before the sell date',
        itemName: CONJURED_MANA_CAKE,
        sellIn: 5,
        quality: 10,
        expectedSellIn: 4,
        expectedQuality: 8,
      },
      {
        description: 'apply to any item whose name starts with Conjured',
        itemName: CONJURED_ELIXIR,
        sellIn: 5,
        quality: 10,
        expectedSellIn: 4,
        expectedQuality: 8,
      },
      {
        description: 'decrease quality twice as fast as an expired ordinary item',
        itemName: CONJURED_MANA_CAKE,
        sellIn: 0,
        quality: 10,
        expectedSellIn: -1,
        expectedQuality: 6,
      },
      {
        description: 'never have negative quality before the sell-by date',
        itemName: CONJURED_MANA_CAKE,
        sellIn: 5,
        quality: 1,
        expectedSellIn: 4,
        expectedQuality: 0,
      },
      {
        description: 'never have negative quality after the sell-by date',
        itemName: CONJURED_MANA_CAKE,
        sellIn: 0,
        quality: 3,
        expectedSellIn: -1,
        expectedQuality: 0,
      },
    ];

    it.each(cases)('$description', (testCase) => {
      expectUpdatedItem(testCase.itemName, testCase);
    });
  });

  describe('Sulfuras', () => {
    it.each([0, -1])('does not change with sellIn %i', (sellIn) => {
      expectUpdatedItem(SULFURAS, {
        description: 'does not change',
        sellIn,
        quality: 80,
        expectedSellIn: sellIn,
        expectedQuality: 80,
      });
    });
  });

  describe('inventory updates', () => {
    it('updates every item independently', () => {
      const items = [
        new Item(ORDINARY_ITEM, 5, 10),
        new Item(AGED_BRIE, 0, 10),
        new Item(BACKSTAGE_PASS, 5, 20),
        new Item(SULFURAS, 0, 80),
      ];

      const updatedItems = new GildedRose(items).updateQuality();

      expect(updatedItems).toEqual([
        new Item(ORDINARY_ITEM, 4, 9),
        new Item(AGED_BRIE, -1, 12),
        new Item(BACKSTAGE_PASS, 4, 23),
        new Item(SULFURAS, 0, 80),
      ]);
    });

    it('supports an empty inventory', () => {
      const updatedItems = new GildedRose().updateQuality();

      expect(updatedItems).toEqual([]);
    });
  });
});
