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
          @change="setLog"
        >
          Logarithmic
        </b-form-checkbox>
      </div>
      <div>
        <b-form-checkbox
          id="checkbox-2"
          @change="switchAverage"
        >
          Average
        </b-form-checkbox>
      </div>
      <div>
        <b-form-checkbox
          id="checkbox-3"
          @change="switchMedian"
        >
          Median
        </b-form-checkbox>
      </div>
      <div>
        <b-form-checkbox
          id="checkbox-4"
          @change="switchPercentile"
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
    switchPercentile() {
      if (!this.series.find(s => s.name === 'Percent')) {
        const ser = {
          name: 'Percent',
          type: 'line',
          data: []
        }
        const {gist} = this;
        const values = Object.values(gist);
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
        for (const days of Object.keys(gist)) {
          ser.data.push(percentile[gist[days]])
        }
        console.log(ser.data)
        this.series.push(ser);
      }else{
        this.series = this.series.filter(s => s.name !== 'Percent')
      }
    },
    setLog() {
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
      console.log(labels, ser.data)
      options.labels = labels;
      this.chartOptions = options;
      this.series = [ser]
    },
    switchAverage() {
      if (!this.series.find(s => s.name === 'Average')) {
        const ser = {
          name: 'Average',
          type: 'line',
          data: []
        }
        let sum = 0;
        for (const days of Object.keys(this.gist)) {
          sum += this.gist[days];
        }
        const average = sum / Object.keys(this.gist).length;
        for (const d in this.gist) ser.data.push(average);
        this.series.push(ser)
        console.log(this.data.datasets)
      } else {
        this.series = this.series.filter(s => s.name !== 'Average')
      }
    },
    switchMedian() {
      if (!this.series.find(s => s.name === 'Median')) {
        const ser = {
          name: 'Median',
          type: 'line',
          data: []
        }
        const values = Object.values(this.gist);
        values.sort(function (a, b) {
          return a - b;
        });
        const half = Math.floor(values.length / 2);
        let median = (values[half - 1] + values[half]) / 2.0;
        if (values.length % 2)
          median = values[half];
        for (const d in this.gist) ser.data.push(median);
        this.series.push(ser)
      } else {
        this.series = this.series.filter(s => s.name !== 'Median')
      }
    }
  }
}
</script>

<style scoped lang="sass">
.chart-container
  border: 1px solid silver

  .options
    padding: 10px
</style>
