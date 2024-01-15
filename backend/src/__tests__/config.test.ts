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
        CACHE_ENABLED: true,
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
        POOLS_JSON_TREE_URL: 'https://api.github.com/repos/litecoin-foundation/mining-pools-ltc/git/trees/master',
        POOLS_JSON_URL: 'https://raw.githubusercontent.com/litecoin-foundation/mining-pools-ltc/master/pools.json',
        AUDIT: false,
        ADVANCED_GBT_AUDIT: false,
        ADVANCED_GBT_MEMPOOL: false,
        RUST_GBT: false,
        CPFP_INDEXING: false,
        MAX_BLOCKS_BULK_QUERY: 0,
        DISK_CACHE_BLOCK_INTERVAL: 6,
        MAX_PUSH_TX_SIZE_WEIGHT: 400000,
        ALLOW_UNREACHABLE: true,
        PRICE_UPDATES_PER_HOUR: 1,
      });

      expect(config.ELECTRUM).toStrictEqual({ HOST: '127.0.0.1', PORT: 3306, TLS_ENABLED: true });

      expect(config.ESPLORA).toStrictEqual({
        REST_API_URL: 'http://127.0.0.1:3000',
        UNIX_SOCKET_PATH: null,
        BATCH_QUERY_BASE_SIZE: 1000,
        RETRY_UNIX_SOCKET_AFTER: 30000,
        REQUEST_TIMEOUT: 10000,
        FALLBACK_TIMEOUT: 5000,
        FALLBACK: [],
       });

      expect(config.CORE_RPC).toStrictEqual({
        HOST: '127.0.0.1',
        PORT: 9332,
        USERNAME: 'mempool',
        PASSWORD: 'mempool',
        TIMEOUT: 60000,
        COOKIE: false,
        COOKIE_PATH: '/bitcoin/.cookie'
      });

      expect(config.SECOND_CORE_RPC).toStrictEqual({
        HOST: '127.0.0.1',
        PORT: 9332,
        USERNAME: 'mempool',
        PASSWORD: 'mempool',
        TIMEOUT: 60000,
        COOKIE: false,
        COOKIE_PATH: '/bitcoin/.cookie'
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
        PID_DIR: ''
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
        MEMPOOL_API: 'https://litecoinspace.org/api/v1',
        MEMPOOL_ONION: 'http://TODO: litecoin.onion/api/v1',
      });

      expect(config.MAXMIND).toStrictEqual({
        ENABLED: false,
        GEOLITE2_CITY: '/usr/local/share/GeoIP/GeoLite2-City.mmdb',
        GEOLITE2_ASN: '/usr/local/share/GeoIP/GeoLite2-ASN.mmdb',
        GEOIP2_ISP: '/usr/local/share/GeoIP/GeoIP2-ISP.mmdb'
      });

      expect(config.REPLICATION).toStrictEqual({
        ENABLED: false,
        AUDIT: false,
        AUDIT_START_HEIGHT: 774000,
        SERVERS: []
      });

      expect(config.MEMPOOL_SERVICES).toStrictEqual({
        API: "",
        ACCELERATIONS: false,
      });

      expect(config.REDIS).toStrictEqual({
        ENABLED: false,
        UNIX_SOCKET_PATH: '',
        BATCH_QUERY_BASE_SIZE: 5000,
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

      expect(config.EXTERNAL_DATA_SERVER).toStrictEqual(fixture.EXTERNAL_DATA_SERVER);

      expect(config.MEMPOOL_SERVICES).toStrictEqual(fixture.MEMPOOL_SERVICES);

      expect(config.REDIS).toStrictEqual(fixture.REDIS);
    });
  });

  test('should ensure the docker start.sh script has default values', () => {
    jest.isolateModules(() => {
      const startSh = fs.readFileSync(`${__dirname}/../../../docker/backend/start.sh`, 'utf-8');
      const fixture = JSON.parse(fs.readFileSync(`${__dirname}/../__fixtures__/mempool-config.template.json`, 'utf8'));

      function parseJson(jsonObj, root?) {
        for (const [key, value] of Object.entries(jsonObj)) {
          // We have a few cases where we can't follow the pattern
          if (root === 'MEMPOOL' && key === 'HTTP_PORT') {
            if (process.env.CI) {
              console.log('skipping check for MEMPOOL_HTTP_PORT');
            }
            continue;
          }

          if (root) {
              //The flattened string, i.e, __MEMPOOL_ENABLED__
              const replaceStr = `${root ? '__' + root + '_' : '__'}${key}__`;

              //The string used as the environment variable, i.e, MEMPOOL_ENABLED
              const envVarStr = `${root ? root : ''}_${key}`;

              let defaultEntry;
              //The string used as the default value, to be checked as a regex, i.e, __MEMPOOL_ENABLED__=${MEMPOOL_ENABLED:=(.*)}
              if (Array.isArray(value)) {
                defaultEntry = `${replaceStr}=\${${envVarStr}:=[]}`;
                if (process.env.CI) {
                  console.log(`looking for ${defaultEntry} in the start.sh script`);
                }
                //Regex matching does not work with the array values
                expect(startSh).toContain(defaultEntry);
              } else {
                 defaultEntry = replaceStr + '=' + '\\${' + envVarStr + ':=(.*)' + '}';
                 if (process.env.CI) {
                  console.log(`looking for ${defaultEntry} in the start.sh script`);
                }
                const re = new RegExp(defaultEntry);
                expect(startSh).toMatch(re);
              }

              //The string that actually replaces the values in the config file
              const sedStr = 'sed -i "s!' + replaceStr + '!${' + replaceStr + '}!g" mempool-config.json';
              if (process.env.CI) {
                console.log(`looking for ${sedStr} in the start.sh script`);
              }
              expect(startSh).toContain(sedStr);
            }
          else {
            parseJson(value, key);
          }
        }
      }

      parseJson(fixture);
    });
  });

  test('should ensure that the mempool-config.json Docker template has all the keys', () => {
    jest.isolateModules(() => {
      const fixture = JSON.parse(fs.readFileSync(`${__dirname}/../__fixtures__/mempool-config.template.json`, 'utf8'));
      const dockerJson = fs.readFileSync(`${__dirname}/../../../docker/backend/mempool-config.json`, 'utf-8');

      function parseJson(jsonObj, root?) {
        for (const [key, value] of Object.entries(jsonObj)) {
          switch (typeof value) {
            case 'object': {
              if (Array.isArray(value)) {
                // numbers, arrays and booleans won't be enclosed by quotes
                const replaceStr = `${root ? '__' + root + '_' : '__'}${key}__`;
                expect(dockerJson).toContain(`"${key}": ${replaceStr}`);
                break;
              } else {
                //Check for top level config keys
                expect(dockerJson).toContain(`"${key}"`);
                parseJson(value, key);
                break;
              }
            }
            case 'string': {
              // strings should be enclosed by quotes
              const replaceStr = `${root ? '__' + root + '_' : '__'}${key}__`;
              expect(dockerJson).toContain(`"${key}": "${replaceStr}"`);
              break;
            }
            default: {
              // numbers, arrays and booleans won't be enclosed by quotes
              const replaceStr = `${root ? '__' + root + '_' : '__'}${key}__`;
              expect(dockerJson).toContain(`"${key}": ${replaceStr}`);
              break;
            }
          }
        };
      }
      parseJson(fixture);
    });
  });


});
