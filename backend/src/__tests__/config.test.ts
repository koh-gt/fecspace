import * as fs from 'fs';

describe('Mempool Backend Config', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('should return defaults when no file is present', () => {
    jest.isolateModules(() => {
      jest.mock('../../mempool-config.json', () => ({}), { virtual: true });

      const config = jest.requireActual('../config').default;

      expect(config.MEMPOOL).toStrictEqual({
        ENABLED: true,
        NETWORK: 'mainnet',
        BACKEND: 'none',
        BLOCKS_SUMMARIES_INDEXING: false,
        HTTP_PORT: 8999,
        SPAWN_CLUSTER_PROCS: 0,
        API_URL_PREFIX: '/api/v1/',
        AUTOMATIC_BLOCK_REINDEXING: false,
        POLL_RATE_MS: 2000,
        CACHE_DIR: './cache',
        CLEAR_PROTECTION_MINUTES: 20,
        RECOMMENDED_FEE_PERCENTILE: 50,
        BLOCK_WEIGHT_UNITS: 4000000,
        INITIAL_BLOCKS_AMOUNT: 8,
        MEMPOOL_BLOCKS_AMOUNT: 8,
        INDEXING_BLOCKS_AMOUNT: 11000,
        USE_SECOND_NODE_FOR_MINFEE: false,
        EXTERNAL_ASSETS: [],
        EXTERNAL_MAX_RETRY: 1,
        EXTERNAL_RETRY_INTERVAL: 0,
        USER_AGENT: 'mempool',
        STDOUT_LOG_MIN_PRIORITY: 'debug',
        POOLS_JSON_TREE_URL: '',
        POOLS_JSON_URL: '',
        AUDIT: false,
        ADVANCED_GBT_AUDIT: false,
        ADVANCED_GBT_MEMPOOL: false,
        CPFP_INDEXING: false,
        MAX_BLOCKS_BULK_QUERY: 0,
        DISK_CACHE_BLOCK_INTERVAL: 6,
      });

      expect(config.ELECTRUM).toStrictEqual({ HOST: '127.0.0.1', PORT: 3306, TLS_ENABLED: true });

      expect(config.ESPLORA).toStrictEqual({ REST_API_URL: 'http://127.0.0.1:3000', UNIX_SOCKET_PATH: null, RETRY_UNIX_SOCKET_AFTER: 30000 });

      expect(config.CORE_RPC).toStrictEqual({
        HOST: '127.0.0.1',
        PORT: 9573,
        USERNAME: 'user',
        PASSWORD: 'password',
        TIMEOUT: 60000
      });

      expect(config.SECOND_CORE_RPC).toStrictEqual({
        HOST: '127.0.0.1',
        PORT: 8332,
        USERNAME: 'mempool',
        PASSWORD: 'mempool',
        TIMEOUT: 60000
      });

      expect(config.DATABASE).toStrictEqual({
        ENABLED: true,
        HOST: '127.0.0.1',
        SOCKET: '',
        PORT: 3306,
        DATABASE: 'mempool',
        USERNAME: 'mempool',
        PASSWORD: 'mempool',
        TIMEOUT: 180000,
      });

      expect(config.SYSLOG).toStrictEqual({
        ENABLED: true,
        HOST: '127.0.0.1',
        PORT: 514,
        MIN_PRIORITY: 'info',
        FACILITY: 'local7'
      });

      expect(config.STATISTICS).toStrictEqual({ ENABLED: true, TX_PER_SECOND_SAMPLE_PERIOD: 150 });

      expect(config.SOCKS5PROXY).toStrictEqual({
        ENABLED: false,
        USE_ONION: true,
        HOST: '127.0.0.1',
        PORT: 9050,
        USERNAME: '',
        PASSWORD: ''
      });

      expect(config.EXTERNAL_DATA_SERVER).toStrictEqual({
        MEMPOOL_API: 'https://ferritepool.space/api/v1',
        MEMPOOL_ONION: 'http://TODO: ferrite.onion/api/v1',
      });

      expect(config.MAXMIND).toStrictEqual({
        ENABLED: false,
        GEOLITE2_CITY: '/usr/local/share/GeoIP/GeoLite2-City.mmdb',
        GEOLITE2_ASN: '/usr/local/share/GeoIP/GeoLite2-ASN.mmdb',
        GEOIP2_ISP: '/usr/local/share/GeoIP/GeoIP2-ISP.mmdb'
      });
    });
  });

  test('should override the default values with the passed values', () => {
    jest.isolateModules(() => {
      const fixture = JSON.parse(fs.readFileSync(`${__dirname}/../__fixtures__/mempool-config.template.json`, 'utf8'));
      jest.mock('../../mempool-config.json', () => (fixture), { virtual: true });

      const config = jest.requireActual('../config').default;

      expect(config.MEMPOOL).toStrictEqual(fixture.MEMPOOL);

      expect(config.ELECTRUM).toStrictEqual(fixture.ELECTRUM);

      expect(config.ESPLORA).toStrictEqual(fixture.ESPLORA);

      expect(config.CORE_RPC).toStrictEqual(fixture.CORE_RPC);

      expect(config.SECOND_CORE_RPC).toStrictEqual(fixture.SECOND_CORE_RPC);

      expect(config.DATABASE).toStrictEqual(fixture.DATABASE);

      expect(config.SYSLOG).toStrictEqual(fixture.SYSLOG);

      expect(config.STATISTICS).toStrictEqual(fixture.STATISTICS);

      expect(config.SOCKS5PROXY).toStrictEqual(fixture.SOCKS5PROXY);

      expect(config.PRICE_DATA_SERVER).toStrictEqual(fixture.PRICE_DATA_SERVER);

      expect(config.EXTERNAL_DATA_SERVER).toStrictEqual(fixture.EXTERNAL_DATA_SERVER);
    });
  });
});
