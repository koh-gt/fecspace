# Deploying an Enterprise Production Instance

These instructions are for setting up a serious production Litecion Space website for Litecoin (mainnet, testnet).

Again, this setup is no joke—home users should use [one of the other installation methods](../#installation-methods).

### Server Hardware

Mempool v2 is powered by [electrs-ltc-esplora](https://github.com/rust-litecoin/electrs-ltc/tree/esplora), which is a beast.

I recommend a beefy server:

- 20-core CPU (more is better)
- 64GB RAM (more is better)
- 4TB SSD (NVMe is better)

### HDD vs SSD vs NVMe

If you don't have a fast SSD or NVMe-backed disk, that's fine—go online and buy some fast new NVMe drives. When they arrive, install them, throw away your old HDDs, and then proceed with the rest of this guide.

### Filesystem

For maximum performance, I use 2x 2TB NVMe SSDs in a RAID 0 using ZFS with lots of RAM for the ARC L2 cache.

```
% zpool list -v
NAME        SIZE  ALLOC   FREE  CKPOINT  EXPANDSZ   FRAG    CAP  DEDUP    HEALTH  ALTROOT
nvm        3.62T  1.25T  2.38T        -         -     2%    34%  1.00x    ONLINE  -
  nvd0p3   1.81T   629G  1.20T        -         -     2%  33.9%      -  ONLINE
  nvd1p3   1.81T   646G  1.18T        -         -     2%  34.8%      -  ONLINE
```

For maximum flexibility of configuration, I recommend separate partitions for each data folder:

```
Filesystem                             Size    Used   Avail Capacity  Mounted on
nvm/bitcoin                          766G    648M    765G     0%    /bitcoin
nvm/bitcoin/blocks                   1.1T    375G    765G    33%    /bitcoin/blocks
nvm/bitcoin/chainstate               770G    4.5G    765G     1%    /bitcoin/chainstate
nvm/bitcoin/electrs                  772G    7.3G    765G     1%    /bitcoin/electrs
nvm/bitcoin/indexes                  799G     34G    765G     4%    /bitcoin/indexes
nvm/electrs                          765G    128K    765G     0%    /electrs
nvm/electrs/mainnet                  765G    112K    765G     0%    /electrs/mainnet
nvm/electrs/mainnet/cache            765G    4.4M    765G     0%    /electrs/mainnet/newindex/cache
nvm/electrs/mainnet/history          1.0T    300G    765G    28%    /electrs/mainnet/newindex/history
nvm/electrs/mainnet/txstore          1.3T    530G    765G    41%    /electrs/mainnet/newindex/txstore
nvm/electrs/testnet                  765G    104K    765G     0%    /electrs/testnet
nvm/electrs/testnet/cache            765G    1.6M    765G     0%    /electrs/testnet/newindex/cache
nvm/electrs/testnet/history          784G     19G    765G     2%    /electrs/testnet/newindex/history
nvm/electrs/testnet/txstore          803G     38G    765G     5%    /electrs/testnet/newindex/txstore
nvm/mempool                          789G     24G    765G     3%    /mempool
nvm/mysql                            766G    648M    765G     0%    /mysql
tmpfs                                1.0G    1.3M    1.0G     0%    /var/cache/nginx
```

### Build Dependencies

You'll probably need these:

```
pkg install -y zsh sudo git screen curl wget neovim rsync nginx openssl openssh-portable py38-pip py38-certbot-nginx boost-libs autoconf automake gmake gcc libevent libtool pkgconf mariadb105-server mariadb105-client
```

### Node.js + npm

Build Node.js v16.16.0 and npm v8 from source using `nvm`:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | zsh
source $HOME/.zshrc
nvm install v16.16.0 --shared-zlib
nvm alias default node
```

### Rust

Build Rust from latest source:

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Tor

Install Tor add Bitcoin to the `_tor` group:

```
pkg install -y tor
pw user mod bitcoin -G _tor
```

Then configure `/usr/local/etc/tor/torrc` as follows:

```
RunAsDaemon 1
SOCKSPort 9050
ControlPort 9051
Log notice syslog

CookieAuthentication 1
CookieAuthFileGroupReadable 1
CookieAuthFile /var/db/tor/control_auth_cookie
DataDirectory /var/db/tor
DataDirectoryGroupReadable 1

HiddenServiceDir /var/db/tor/mempool
HiddenServicePort 80 127.0.0.1:81
HiddenServiceVersion 3
```

### Litecoin

Build [Litecoin Core](https://github.com/litecoin-project/litecoin) from source.

Configure your `litecoin.conf` like this:

```
datadir=/litecoin
server=1
txindex=1
listen=1
discover=1
par=16
dbcache=4096
maxmempool=1337
mempoolexpiry=999999
maxconnections=42
onion=127.0.0.1:9050
rpcallowip=127.0.0.1
rpcuser=foo
rpcpassword=bar

[main]
bind=127.0.0.1:9333
rpcbind=127.0.0.1:9332
whitelist=bloomfilter@127.0.0.1

[test]
daemon=1
bind=127.0.0.1:19333
rpcbind=127.0.0.1:19332
```

### Electrs

Install [electrs-ltc-esplora](https://github.com/rust-litecoin/electrs-ltc/tree/esplora) from source:

```
git clone https://github.com/rust-litecoin/electrs-ltc/
cd electrs-ltc
git checkout esplora
```

You'll need one instance per network. Build and run them one at a time:

```
./electrs-start-mainnet
./electrs-start-testnet
```

### MariaDB

Import the historical mempool fee database snapshot:

```
mysql -u root
create database mempool;
grant all on mempool.* to 'mempool'@'localhost' identified by 'mempool';
create database mempool_testnet;
grant all on mempool_testnet.* to 'mempool_testnet'@'localhost' identified by 'mempool_testnet';
```

### Mempool

After all 3 electrs instances are fully indexed, install your 3 Mempool nodes:

```
./mempool-install-all
./mempool-upgrade-all
```

Finally, start your 3 Mempool backends:

```
./mempool-start-all
```

### Nginx

Get an SSL certificate using `certbot`:

```
certbot --nginx -d mempool.ninja
```

Make a symlink from `/usr/local/etc/nginx/mempool` to `/mempool/mempool`, copy the `nginx.conf`, and edit as necessary. You probably only need to edit the top-level `nginx.conf` file.

```
cd /usr/local/etc/nginx
ln -s /mempool/mempool
cp /mempool/mempool/nginx.conf .
vi nginx.conf
```

Restart `nginx`:

```
service nginx restart
```

### Done

If everything went well, your site should look like the one at https://litecoinspace.org/.
