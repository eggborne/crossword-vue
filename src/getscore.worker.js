/* eslint-disable func-names */
/* eslint-disable linebreak-style */

onmessage = function (e) {
  let data = e.data;
  if (!data) {
    console.error('worker got nothing');
  } else {
    if (data.dataType === 'cellGrid') {
      console.log('worker got', data)
      data.payload = JSON.parse(data.payload);
      data = {
        attribute: data.attribute === 'offensive' ? 'swastika' : data.attribute,
        grid: data.payload,
        action: data.action
      };
    }
    console.log('worker got', data);
  }
};
