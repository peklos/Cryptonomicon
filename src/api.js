export const loadTickers = async (tickers) => {
    // 1. Получаем все доступные пары с Binance
    const allSymbolsResponse = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    const allSymbolsData = await allSymbolsResponse.json();
    const validSymbols = allSymbolsData.symbols.map(s => s.symbol);

    // 2. Формируем массив тикеров в формате "BTCUSDT", "ETHUSDT"...
    const requestedSymbols = tickers.map(t => `${t}USDT`);

    // 3. Фильтруем только валидные тикеры для массового запроса
    const validRequestedSymbols = requestedSymbols.filter(s => validSymbols.includes(s));

    // 4. Делаем запрос только для валидных тикеров (если они есть)
    let validTickersData = [];
    if (validRequestedSymbols.length > 0) {
        const url = `https://api.binance.com/api/v3/ticker/price?symbols=[${validRequestedSymbols.map(s => `"${s}"`).join(',')}]`;
        const response = await fetch(url);
        validTickersData = await response.json();
    }

    // 5. Собираем итоговый массив, включая невалидные тикеры с price: false
    const result = requestedSymbols.map(symbol => {
        const foundTicker = validTickersData.find(t => t.symbol === symbol);
        return foundTicker 
            ? foundTicker  // если тикер валидный, возвращаем {symbol, price}
            : { symbol, price: false };  // если невалидный, ставим price: false
    });

    return result;
};