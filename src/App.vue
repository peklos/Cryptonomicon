<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <add-ticker-section :tickers="this.tickers" @add-ticker="add($event)" />

      <template v-if="this.tickers.length > 0">
        <div class="rounded-md font-medium">
          Найти: <input class="rounded-lg" v-model="filter" />
          <button
            class="border-solid border-red-300 font-medium bg-gray-300 rounded-full py-2 px-5 m-2 hover:bg-gray-400 hover:text-white duration-150 disabled:bg-red-300 disabled:text-black"
            @click="page -= 1"
            :disabled="page == 1"
          >
            Назад
          </button>
          <button
            class="border-solid border-red-300 font-medium bg-gray-300 rounded-full py-2 px-5 hover:bg-gray-400 hover:text-white duration-150 disabled:bg-red-300 disabled:text-black"
            @click="page += 1"
            :disabled="hasNextPage == false"
          >
            Вперед
          </button>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginationTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4': selectedTicker === t,
              'bg-red-100': t.price == 'NaN',
              'bg-white': t.price != 'NaN',
            }"
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <!-- border-4 для обводки -->
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USDT
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ t.price }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="deleteTicker(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 duration-150 hover:text-black-500 hover:bg-gray-200 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <graph-section
        ref="graphSection"
        :graph="graph"
        :selected-ticker="selectedTicker"
        @update:selected-ticker="selectedTicker = $event"
        @update-max-elements="handleMaxElementsUpdate"
        @trim-graph="trimGraph"
      />
    </div>
  </div>
</template>

<script>
import { loadTickers } from "./api";
import AddTickerSection from "./components/AddTickerSection.vue";
import GraphSection from "./components/GraphSection.vue";

export default {
  data() {
    return {
      tickers: JSON.parse(localStorage.getItem("cryptonomicon-list")) || [],
      errorMessage: "",
      graph: [],
      selectedTicker: null,
      page: 1,
      filter: "",
    };
  },

  components: {
    AddTickerSection,
    GraphSection,
  },

  computed: {
    startIndex() {
      return 6 * (this.page - 1);
    },

    endIndex() {
      return 6 * this.page;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.toUpperCase().includes(this.filter.toUpperCase())
      );
    },

    paginationTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  created() {
    const tickersData = localStorage.getItem("cryptonomicon-list");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
    }

    setInterval(this.updateTickers, 2000);

    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = Number(windowData.page);
    }
  },

  methods: {
    trimGraph(maxLength) {
      if (this.graph.length > maxLength) {
        this.graph = this.graph.slice(-maxLength);
      }
    },
    
    handleMaxElementsUpdate(max) {
      this.trimGraph(max);
    },

    formatPrice(price) {
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    add(tickerFromButton) {
      const correctTicker = tickerFromButton.toUpperCase();

      if (this.tickers.find((t) => t.name == correctTicker)) {
        this.errorMessage = "Такой тикер уже добавлен";
      } else if (correctTicker == "") {
        this.errorMessage = "Введите название криптовалюты";
      } else {
        this.errorMessage = "";
        const newTicker = { name: correctTicker, price: "-" };
        // this.tickers.push(newTicker);

        this.tickers = [...this.tickers, newTicker];

        this.ticker = "";
        this.filter = "";
      }
    },

    deleteTicker(ticker) {
      this.tickers = this.tickers.filter((t) => t != ticker);
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));

      if (this.selectedTicker == ticker) {
        this.selectedTicker = null;
      }
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },

    async updateTickers() {
      if (!this.tickers.length) {
        return;
      }
      const exchangeData = await loadTickers(this.tickers.map((t) => t.name));

      this.tickers.forEach((ticker) => {
        const found = exchangeData.find(
          (item) => item.symbol === `${ticker.name}USDT` // Ищем "BTCUSDT" для "BTC"
        );
        if (found) {
          ticker.price = parseFloat(found.price); // Преобразуем строку в число
          ticker.price = this.formatPrice(ticker.price);
          if (ticker == this.selectedTicker) {
            this.graph.push(ticker.price);
            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift();
            }
          }
        }
      });
    },
  },

  watch: {
    filter() {
      this.page = 1;
    },

    pageStateOptions(v) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${v.filter}&page=${v.page}`
      );
    },

    paginationTickers() {
      if (this.paginationTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    selectedTicker() {
      this.graph = [];
    },

    tickers() {
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    },
  },
};
</script>

