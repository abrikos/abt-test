import moment from 'moment';

const getMaxId = (data) => Math.max(...data.filter(i => !!i.id).map(i => i.id));

export default function ({app}, inject) {
  inject('saveDb', data => {
    let maxId = getMaxId(data);
    console.log('Save data', maxId);
    for (const item of data) {
      if (!item.id) {
        maxId++;
        item.id = maxId;
      }
    }
    localStorage.setItem('data', JSON.stringify(data));
    return data;
  })
  inject('loadDb', () => {
    console.log('load data');
    const mock = [
      {id: 1, registration: '2021-10-12', activity: '2021-11-12'},
      {id: 2, registration: '2021-11-12', activity: '2021-11-22'},
      {id: 3, registration: '2021-11-13', activity: '2021-11-25'},
      {id: 4, registration: '2021-11-14', activity: '2021-12-12'},
      {id: 5, registration: '2021-11-14', activity: '2021-11-15'},
      {id: 6, registration: '2021-11-18', activity: '2021-12-12'},
      {id: 7, registration: '2021-11-18', activity: '2021-12-12'},
      {id: 8, registration: '2021-11-18', activity: '2021-12-12'},
    ]
    let stored = []
    try {
      stored = JSON.parse(localStorage.getItem('data'));
    } catch (e) {
      console.warn(e)
    }
    const ret = stored && stored.length ? stored : mock;
    for (const item of ret) {
      item.lifeDays = moment(item.activity).diff(moment(item.registration), 'days');
      item.registeredDays = moment().diff(moment(item.registration), 'days');
    }
    return ret;
  })
}
