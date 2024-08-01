import { query } from '../../utils/axios-query';
import priceUpdater, { PriceFeed, PriceHistory } from '../price-updater';

 interface CandleData {
  time: number;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface CandleApiResponse {
  bars: CandleData[];
}

class XeggexApi implements PriceFeed {
  public name: string = 'Xeggex';
  public currencies: string[] = ['USDT'];

  public url: string = 'https://api.xeggex.com/api/v2/ticker/FEC_USDT';

  constructor() {
  }

  public async $fetchPrice(currency): Promise<number> {
    const response = await query(this.url);
    if (response && response['lastPrice']) {
      return parseFloat(response['last_price']);
    } else {
      return -1;
    }
  } 

  public async $fetchRecentPrice(currencies: string[], type: 'hour' | 'day'): Promise<PriceHistory> {
    const priceHistory: PriceHistory = {};
  
    for (const currency of currencies) {
      if (this.currencies.includes(currency) === false) {
        continue;
      }
  
      const url = `https://api.xeggex.com/api/v2/market/candles?symbol=FEC%2FUSDT&resolution=30&countBack=336&firstDataRequest=1`;
      const response = await query(url) as CandleApiResponse;

      if (response && response.bars) {
        for (const bar of response.bars) {
          const time = Math.round(bar.time / 1000);
          if (priceHistory[time] === undefined) {
            priceHistory[time] = priceUpdater.getEmptyPricesObj();
          }
          priceHistory[time][currency] = bar.close; // Using the 'close' price
        }
      }
    }
  
    return priceHistory;
  }
}

export default XeggexApi;