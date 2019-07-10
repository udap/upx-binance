# upx-binance

# Start by nodejs
```
# install nodejs
npm install
npm run start
```

# Start by Docker
```
docker build -t upx-relay .
docker run -d -p 8090:8090 --rm --name upx-relay upx-relay
# open browser in http://localhost:8090
```

# How to use this tool
1. login with ethereum wallet
2. input your binance chain address and the amount of UPX token you want to swap
3. click the swap button and wait for your ethereum tx to be confirmed
4. wait for UPX.B transfered to your binance chain address
