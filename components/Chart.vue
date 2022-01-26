<template>
  <div class="chart-container">
    &nbsp;
    <VueApexCharts type="line" height="350" :options="chartOptions" :series="series"></VueApexCharts>
    <!--    <bar-chart :data="chartData" :height="200" :options="options" key="Math.random()"/>-->
    <div class="options d-flex justify-content-around">

      <div>
        <b-form-checkbox v-if="false"
                         id="checkbox-1"
                         v-model="logarithmic"
                         @change="setLogarithmic"
        >
          Logarithmic
        </b-form-checkbox>
      </div>
      <div>
        <b-form-checkbox
          id="checkbox-2"
          @change="switchSeries('Average')"
        >
          Average
        </b-form-checkbox>
      </div>
      <div>
        <b-form-checkbox
          id="checkbox-3"
          @change="switchSeries('Median')"
        >
          Median
        </b-form-checkbox>
      </div>
      <div>
        <b-form-checkbox
          id="checkbox-4"
          @change="switchSeries('Percent')"
        >
          Percents
        </b-form-checkbox>
      </div>

    </div>
  </div>
</template>

<script>

export default {
  name: "Chart",
  components: {
    VueApexCharts: () => import('vue-apexcharts')
  },
  data() {
    return {
      data: {labels: [], datasets: []},
      logarithmic: false,
      items: [],
      series: [],
      chartOptions: {
        chart: {
          height: 350,
          type: 'line',
          stacked: false
        },
        stroke: {
          width: [0, 4]
        },
        title: {
          text: 'Histogram'
        },
        dataLabels: {
          enabled: true,
          formatter: v => v % 1 === 0 ? v : v.toFixed(2),
          // enabledOnSeries: [0]
        },
        labels: [],
        // TODO add axis for percent
        yaxis: {
          labels: {
            formatter: v => v % 1 === 0 ? v : v.toFixed(2),
          },
          logarithmic: false,
          min: 0,
          title: {
            text: 'Users',
          },

        }
      }
    }
  },
  computed: {
    gist() {
      const gist = {};
      for (const item of this.items) {
        if (!gist[item.lifeDays]) {
          gist[item.lifeDays] = 1;
        } else {
          gist[item.lifeDays]++;
        }
      }
      return gist;
    },
  },
  created() {
    this.$nuxt.$on('calculated', this.drawData);
  },
  methods: {
    switchSeries(name) {
      if (!this.series.find(s => s.name === name)) {
        const series = {
          name,
          type: 'line',
        }
        const {gist} = this;
        switch (name){
          case 'Percent':
            series.data = this.calcPercent(gist);
            break;
          case 'Average':
            series.data = this.calcAverage(gist);
            break;
          case 'Median':
            series.data = this.calcMedian(gist);
            break;
        }
        this.series.push(series)
      } else {
        this.series = this.series.filter(s => s.name !== name)
      }

    },

    calcPercent(data){
      const values = Object.values(data);
      const percentile = {};
      for (const v of values) {
        if (!percentile[v]) {
          percentile[v] = 1;
        } else {
          percentile[v]++;
        }
      }
      for (const v of Object.keys(percentile)) {
        percentile[v] = percentile[v] / values.length * 100;
      }
      const ret = [];
      for (const days of Object.keys(data)) {
        ret.push(percentile[data[days]])
      }
      console.log(ret)
      return ret;
    },

    calcAverage(data){
      let sum = 0;
      for (const days of Object.keys(data)) {
        sum += data[days];
      }
      const average = sum / Object.keys(data).length;
      const ret = [];
      for (const d in data) ret.push(average);
      return ret;
    },

    calcMedian(data){
      const values = Object.values(data);
      values.sort(function (a, b) {
        return a - b;
      });
      const half = Math.floor(values.length / 2);
      let median = (values[half - 1] + values[half]) / 2;
      if (values.length % 2)
        median = values[half];
      const ret = [];
      for (const d in data) ret.push(median);
      return ret;
    },

    setLogarithmic() {
      // TODO Why does this have no effect?
      this.chartOptions.yaxis.logarithmic = this.logarithmic;
    },

    drawData(data) {
      const options = {...this.chartOptions};
      this.items = data;
      const ser = {
        name: 'Users per day',
        type: 'bar',
        data: []
      }
      const labels = [];
      for (const days of Object.keys(this.gist)) {
        labels.push(days);
        ser.data.push(this.gist[days]);
      }
      options.labels = labels;
      this.chartOptions = options;
      this.series = [ser]
    },

  }
}
</script>

<style scoped lang="sass">
.chart-container
  border: 1px solid silver

  .options
    padding: 10px
</style>
