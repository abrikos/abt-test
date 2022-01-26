<template>
  <div class="container">
    <h1>User activity calculation</h1>
    <Chart/>
    <div class="d-flex justify-content-between  align-items-center">
      <div>
        <b-button variant="primary" @click="clearDates" v-b-modal.modal-add-user>Add user</b-button>
      </div>
      <b-alert :show="!!retention">Rolling Retention {{ days }} days: <strong>{{ retention }}</strong></b-alert>
    </div>
    <table>
      <tr>
        <th>UserId</th>
        <th>Registration date</th>
        <th>Last activity date</th>
      </tr>
      <tr v-for="item of items" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.registration }}</td>
        <td>{{ item.activity }}</td>
        <td>{{ item.lifeDays }}</td>
        <td>{{ item.registeredDays }}</td>
        <td>
          <b-button variant="danger" size="sm" @click="deleteUser(item)">Delete</b-button>
        </td>
      </tr>
    </table>
    <b-button variant="secondary" @click="reset">Reset data</b-button>
    <b-modal id="modal-add-user" title="Add user" @ok="add">
      <b-row>
        <b-col>
          <strong>Registration date</strong>
          <b-calendar v-model="registration" locale="en-US" block></b-calendar>
        </b-col>
        <b-col>
          <strong>Last activity date</strong>
          <b-calendar v-model="activity" locale="en-US" block></b-calendar>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>
import Chart from '../components/Chart';

export default {
  name: 'IndexPage',
  components: {Chart},
  data() {
    return {
      days: 7,
      items: [],
      registration: '',
      activity: '',
      retention: ''
    }
  },
  mounted() {
    this.items = this.$loadDb();
    this.retentionCalculate();
  },
  methods: {
    clearDates() {
      this.activity = '';
      this.registration = '';
    },
    add(e) {
      e.preventDefault();
      this.retention = '';
      const {registration, activity} = this;
      if (!(registration && activity)) return this.$bvModal.msgBoxOk('Please select both dates', {
        title: 'Error',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        headerClass: 'p-2 border-bottom-0',
        footerClass: 'p-2 border-top-0',
        centered: true
      })
      this.items.push({registration, activity})
      this.save();
      this.retentionCalculate()
      this.$nextTick(() => {
        this.$bvModal.hide('modal-add-user')
      })
    },
    reset() {
      this.$saveDb([]);
      this.items = this.$loadDb();
      this.retentionCalculate()
    },
    save() {
      this.$saveDb(this.items);
      this.items = this.$loadDb();
      console.log(this.items)
      this.retentionCalculate()
    },
    deleteUser(item) {
      this.items = this.items.filter(i => item.id !== i.id);
      this.$saveDb(this.items);
      this.retentionCalculate()
    },
    retentionCalculate() {
      let returned = 0;
      let newbies = 0;
      for (const item of this.items) {
        if (item.lifeDays <= this.days) returned++;
        if (item.registeredDays >= this.days) newbies++;
        // console.log(JSON.stringify(item), returned, newbies)
      }
      this.$nuxt.$emit("calculated", this.items);
      this.retention = newbies ? (returned / newbies * 100).toFixed(2) : `No registered users older than ${this.days} days`;
    }
  },

}
</script>

<style lang="sass">
.modal-body
  font-size: .8em

  .b-calendar-grid-body
    font-size: .1em !important

table
  margin: auto
  box-shadow: 4px 0 10px 0 #5D6D971A
  border-radius: 10px
  width: 100%

  tr:not(:first-child)
    counter-increment: row-num

  tr
    border-bottom: 1px solid #EEE

  tr:last-child
    border: none

  th
    padding: 5px

  td
    padding: 5px
</style>
