<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add(ticker)"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer hover:bg-gray-400 duration-150"
            @click="add((ticker = 'BTC'))"
          >
            BTC
          </span>
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer hover:bg-gray-400 duration-150"
            @click="add((ticker = 'DOGE'))"
          >
            DOGE
          </span>
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer hover:bg-gray-400 duration-150"
            @click="add((ticker = 'BCH'))"
          >
            BCH
          </span>
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer hover:bg-gray-400 duration-150"
            @click="add((ticker = 'TON'))"
          >
            TON
          </span>
        </div>
        <div class="text-sm text-red-600 mt-3">{{ errorMessage }}</div>
      </div>
    </div>
    <add-button @click="add(ticker)" />
  </section>
</template>

<script>
import AddButton from "./AddButton.vue";

export default {
  data() {
    return {
      ticker: "",
      errorMessage: "",
    };
  },

    props: {
        tickers: {
            type: Array,
            required: true,
            default: () => [],
        }
    },

    emits: {
        'add-ticker': value => typeof value == 'string' 
    },

  components: {
    AddButton,
  },

  methods: {
    add(tickerFromInputs) {
      const correctTicker = tickerFromInputs.toUpperCase();

      if (this.tickers.find((t) => t.name == correctTicker)) {
        this.errorMessage = "Такой тикер уже добавлен";
        this.ticker = "";
      } else if (correctTicker == "") {
        this.errorMessage = "Введите название криптовалюты";
        this.ticker = "";
      } else {
        this.errorMessage = "";
        
        this.$emit("add-ticker", correctTicker);
        
        this.ticker = "";
      }
    },
  },
};
</script>
