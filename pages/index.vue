<template>
  <div class="container">
    <b-button variant="primary" @click="clearDates" v-b-modal.modal-add-user>Add user</b-button>
    <b-button variant="primary" @click="save">Save</b-button>
    <b-button variant="success" @click="retentionCalculate">Calculate</b-button>
    <b-button variant="secondary" @click="reset">Reset data</b-button>
    <b-alert :show="!!retention">{{ retention }}</b-alert>
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
        <td>{{ item.diffReturned }}</td>
        <td>{{ item.diffNewbie }}</td>
        <td>
          <b-button variant="danger" size="sm" @click="deleteUser(item)">Delete</b-button>
        </td>
      </tr>
    </table>
    <b-modal id="modal-add-user" title="Add user" @ok="add">
      <strong>Registration date</strong>
      <b-calendar v-model="registration" locale="en-US" block></b-calendar>
      <strong>Last activity date</strong>
      <b-calendar v-model="activity" locale="en-US" block></b-calendar>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: 'IndexPage',
  data() {
    return {
      days: 7,
      items: [],
      registration: '',
      activity: '',
      retention: ''
    }
  },
  created() {
    this.items = this.$loadDb();
    this.retentionCalculate();
  },
  methods: {
    clearDates() {
      this.activity = '';
      this.registration = '';
    },
    add() {
      this.retention = '';
      const {registration, activity} = this;
      this.items.push({registration, activity})
      this.save();
    },
    reset() {
      this.$saveDb([]);
      this.items = this.$loadDb();
    },
    save() {
      this.$saveDb(this.items);
      this.items = this.$loadDb();
    },
    deleteUser(item) {
      this.items = this.items.filter(i => item.id !== i.id);
      this.$saveDb(this.items);
    },
    retentionCalculate() {
      let returned = 0;
      let newbies = 0;
      for (const item of this.items) {
        if (item.diffReturned <= this.days) returned++;
        if (item.diffNewbie <= this.days) newbies++;
        // console.log(JSON.stringify(item), returned, newbies)
      }

      this.retention = newbies ? (returned / newbies * 100).toFixed(2) : `No new registered users in ${this.days} days`;
    }
  }
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
    padding: 10px

  td
    padding: 10px
</style>
