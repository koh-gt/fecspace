import config from '../config';
import logger from '../logger';
import PricesRepository, { ApiPrice, MAX_PRICES } from '../repositories/PricesRepository';
import BitfinexApi from './price-feeds/bitfinex-api';
import CoinbaseApi from './price-feeds/coinbase-api';
import GeminiApi from './price-feeds/gemini-api';
import KrakenApi from './price-feeds/kraken-api';

export interface PriceFeed {
  name: string;
  url: string;
  urlHist: string;
  currencies: string[];

  $fetchPrice(currency): Promise<number>;
  $fetchRecentPrice(currencies: string[], type: string): Promise<PriceHistory>;
}

export interface PriceHistory {
  [timestamp: number]: ApiPrice;
}

function getMedian(arr: number[]): number {
  const sortedArr = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sortedArr.length / 2);
  return sortedArr.length % 2 !== 0
      ? sortedArr[mid]
      : (sortedArr[mid - 1] + sortedArr[mid]) / 2;
}

class PriceUpdater {
  public historyInserted = false;
  private timeBetweenUpdatesMs = 360_0000 / config.MEMPOOL.PRICE_UPDATES_PER_HOUR;
  private cyclePosition = -1;
  private firstRun = true;
  private lastTime = -1;
  private lastHistoricalRun = 0;
  private running = false;
  private feeds: PriceFeed[] = [];
  private currencies: string[] = ['USD', 'EUR', 'GBP', 'AUD', 'JPY'];
  private latestPrices: ApiPrice;
  private ratesChangedCallback: ((rates: ApiPrice) => void) | undefined;

  constructor() {
    this.latestPrices = this.getEmptyPricesObj();

    this.feeds.push(new KrakenApi());
    this.feeds.push(new CoinbaseApi());
    this.feeds.push(new BitfinexApi());
    this.feeds.push(new GeminiApi());

    this.setCyclePosition();
  }

  public getLatestPrices(): ApiPrice {
    return this.latestPrices;
  }

  public getEmptyPricesObj(): ApiPrice {
    return {
      time: 0,
      USD: -1,
      EUR: -1,
      GBP: -1,
      AUD: -1,
      JPY: -1,
    };
  }

  public setRatesChangedCallback(fn: (rates: ApiPrice) => void): void {
    this.ratesChangedCallback = fn;
  }

  /**
   * We execute this function before the websocket initialization since
   * the websocket init is not done asyncronously
   */
  public async $initializeLatestPriceWithDb(): Promise<void> {
    this.latestPrices = await PricesRepository.$getLatestConversionRates();
  }

  public async $run(): Promise<void> {
    if (config.MEMPOOL.NETWORK === 'testnet') {
      // Coins have no value on testnet, so we want to always show 0
      return;
    }

    if (this.running === true) {
      return;
    }
    this.running = true;

    if ((Math.round(new Date().getTime() / 1000) - this.lastHistoricalRun) > 3600 * 24) {
      // Once a day, look for missing prices (could happen due to network connectivity issues)
      this.historyInserted = false;
    }

    try {
      await this.$updatePrice();
      if (this.historyInserted === false && config.DATABASE.ENABLED === true) {
        await this.$insertHistoricalPrices();
      }
    } catch (e: any) {
      logger.err(`Cannot save LTC prices in db. Reason: ${e instanceof Error ? e.message : e}`, logger.tags.mining);
    }

    this.running = false;
  }

  private getMillisecondsSinceBeginningOfHour(): number {
    const now = new Date();
    const beginningOfHour = new Date(now);
    beginningOfHour.setMinutes(0, 0, 0);
    return now.getTime() - beginningOfHour.getTime();
  }

  private setCyclePosition(): void {
    const millisecondsSinceBeginningOfHour = this.getMillisecondsSinceBeginningOfHour();
    for (let i = 0; i < config.MEMPOOL.PRICE_UPDATES_PER_HOUR; i++) {
      if (this.timeBetweenUpdatesMs * i > millisecondsSinceBeginningOfHour) {
        this.cyclePosition = i;
        return;
      }
    }
    this.cyclePosition = config.MEMPOOL.PRICE_UPDATES_PER_HOUR;
  }

  /**
   * Fetch last LTC price from exchanges, average them, and save it in the database once every hour
   */
  private async $updatePrice(): Promise<void> {
    let forceUpdate = false;
    if (this.firstRun === true && config.DATABASE.ENABLED === true) {
      const lastUpdate = await PricesRepository.$getLatestPriceTime();
      if (new Date().getTime() / 1000 - lastUpdate > this.timeBetweenUpdatesMs / 1000) {
        forceUpdate = true;
      }
      this.firstRun = false;
    }

    const millisecondsSinceBeginningOfHour = this.getMillisecondsSinceBeginningOfHour();

    // Reset the cycle on new hour
    if (this.lastTime > millisecondsSinceBeginningOfHour) {
      this.cyclePosition = 0;
    }
    this.lastTime = millisecondsSinceBeginningOfHour;
    if (millisecondsSinceBeginningOfHour < this.timeBetweenUpdatesMs * this.cyclePosition && !forceUpdate && this.cyclePosition !== 0) {
      return;
    }

    for (const currency of this.currencies) {
      let prices: number[] = [];

      for (const feed of this.feeds) {
        // Fetch prices from API which supports `currency`
        if (feed.currencies.includes(currency)) {
          try {
            const price = await feed.$fetchPrice(currency);
            if (price > -1 && price < MAX_PRICES[currency]) {
              prices.push(price);
            }
            logger.debug(`${feed.name} LTC/${currency} price: ${price}`, logger.tags.mining);
          } catch (e) {
            logger.debug(`Could not fetch LTC/${currency} price at ${feed.name}. Reason: ${(e instanceof Error ? e.message : e)}`, logger.tags.mining);
          }
        }
      }
      if (prices.length === 1) {
        logger.debug(`Only ${prices.length} feed available for LTC/${currency} price`, logger.tags.mining);
      }

      // Compute average price, non weighted
      prices = prices.filter(price => price > 0);
      if (prices.length === 0) {
        this.latestPrices[currency] = -1;
      } else {
        this.latestPrices[currency] = Math.round(getMedian(prices));
      }
    }

    if (config.DATABASE.ENABLED === true && this.cyclePosition === 0) {
      // Save everything in db
      try {
        const p = 60 * 60 * 1000; // milliseconds in an hour
        const nowRounded = new Date(Math.round(new Date().getTime() / p) * p); // https://stackoverflow.com/a/28037042
        await PricesRepository.$savePrices(nowRounded.getTime() / 1000, this.latestPrices);
      } catch (e) {
        logger.err(`Cannot save latest prices into db. Trying again in 5 minutes. Reason: ${(e instanceof Error ? e.message : e)}`);
      }
    }

    this.latestPrices.time = Math.round(new Date().getTime() / 1000);
    logger.info(`Latest BTC fiat averaged price: ${JSON.stringify(this.latestPrices)}`);

    if (this.ratesChangedCallback) {
      this.ratesChangedCallback(this.latestPrices);
    }

    if (!forceUpdate) {
      this.cyclePosition++;
    }

    if (this.latestPrices.USD === -1) {
      this.latestPrices = await PricesRepository.$getLatestConversionRates();
    }
  }

  /**
   * Called once by the database migration to initialize historical prices data (weekly)
   * We use Kraken weekly price from October 3, 2013 up to last month
   * We use Kraken hourly price for the past month
   */
  private async $insertHistoricalPrices(): Promise<void> {
    // Insert Kraken weekly prices
    await new KrakenApi().$insertHistoricalPrice();

    // Insert missing recent hourly prices
    await this.$insertMissingRecentPrices('day');
    await this.$insertMissingRecentPrices('hour');

    this.historyInserted = true;
    this.lastHistoricalRun = new Date().getTime();
  }

  /**
   * Find missing hourly prices and insert them in the database
   * It has a limited backward range and it depends on which API are available
   */
  private async $insertMissingRecentPrices(type: 'hour' | 'day'): Promise<void> {
    const existingPriceTimes = await PricesRepository.$getPricesTimes();

    logger.debug(`Fetching ${type === 'day' ? 'dai' : 'hour'}ly price history from exchanges and saving missing ones into the database`, logger.tags.mining);

    const historicalPrices: PriceHistory[] = [];

    // Fetch all historical hourly prices
    for (const feed of this.feeds) {
      try {
        if (feed.name === 'Coinbase') {
          historicalPrices.push(await feed.$fetchRecentPrice(['USD', 'EUR', 'GBP'], type));
        } else {
          historicalPrices.push(await feed.$fetchRecentPrice(this.currencies, type));
        }
      } catch (e) {
        logger.err(`Cannot fetch hourly historical price from ${feed.name}. Ignoring this feed. Reason: ${e instanceof Error ? e.message : e}`, logger.tags.mining);
      }
    }

    // Group them by timestamp and currency, for example
    // grouped[123456789]['USD'] = [1, 2, 3, 4];
    const grouped = {};
    for (const historicalEntry of historicalPrices) {
      for (const time in historicalEntry) {
        if (existingPriceTimes.includes(parseInt(time, 10))) {
          continue;
        }

        if (grouped[time] === undefined) {
          grouped[time] = {
            USD: [], EUR: [], GBP: [], AUD: [], JPY: []
          };
        }

        for (const currency of this.currencies) {
          const price = historicalEntry[time][currency];
          if (price > -1 && price < MAX_PRICES[currency]) {
            grouped[time][currency].push(typeof price === 'string' ? parseInt(price, 10) : price);
          }
        }
      }
    }

    // Average prices and insert everything into the db
    let totalInserted = 0;
    for (const time in grouped) {
      const prices: ApiPrice = this.getEmptyPricesObj();
      for (const currency in grouped[time]) {
        if (grouped[time][currency].length === 0) {
          continue;
        }
        prices[currency] = Math.round(getMedian(grouped[time][currency]));
      }
      await PricesRepository.$savePrices(parseInt(time, 10), prices);
      ++totalInserted;
    }

    if (totalInserted > 0) {
      logger.notice(`Inserted ${totalInserted} ${type === 'day' ? 'dai' : 'hour'}ly historical prices into the db`, logger.tags.mining);
    } else {
      logger.debug(`Inserted ${totalInserted} ${type === 'day' ? 'dai' : 'hour'}ly historical prices into the db`, logger.tags.mining);
    }
  }
}

export default new PriceUpdater();
