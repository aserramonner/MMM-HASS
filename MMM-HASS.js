/* global Module */

/* Magic Mirror
 * Module: MMM-HASS
 *
 * Simple transposition of Benjamin Roesner´s MMM-FHEM
 * to use it with home assistant
 *
 * GNU GPL v3.0
 */

// TODO: implement the weather icons
// TODO: add support for https

Module.register('MMM-HASS', {

  defaults: {
    host: 'localhost',
    port: '8083',
    initialLoadDelay: 1000,
    updateInterval: 60 * 1000, // every 60 seconds
  },

  // Define required scripts.
  getStyles: function () {
    return ['MMM-HASS.css'];
  },

  notificationReceived(notification, payload) {
        if (notification === 'HASS_1') {
            this.sendSocketNotification('HASS_1', payload);
        } else if (notification === 'HASS_2') {
            this.sendSocketNotification('HASS_2', payload);
        }
  },

  // Override socket notification handler.
  // Module notifications from node_helper
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'DATARECEIVED') {
      this.devices = payload;
      //Log.log(payload);
      this.loaded = true;
      this.updateDom(2000);
    }
  },

  // Method is called when all modules are loaded an the system is ready to boot up
  start: function() {
    Log.info('Starting module: ' + this.name);
    this.loaded = false;
    this.devices = [];
    this.getData();
    var self = this;
    setInterval(function() { self.getData() }, this.config.updateInterval);
  },

    roundValue: function(value) {
                var decimals = 1;
                return parseFloat(value).toFixed(decimals);
    },

getData: function() {
    this.sendSocketNotification('GETDATA', this.config);
},

  /* scheduleUpdate()
   * Schedule next update.
   *
   * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
   */
  scheduleUpdate: function (delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== 'undefined' && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    setInterval(function() { self.sendSocketNotification('GETDATA', self.config) }, nextLoad);
  },

  // Update the information on screen
  getDom: function() {
    var self = this;
    var devices = this.devices;
    var container = document.createElement('div');

    if (!this.loaded)
    {
      var loading = document.createElement('div');
      loading.className = 'device';
      loading.innerHTML = 'Loading ...';
      container.appendChild(loading);
    }
    else
    {

    devices.forEach(function(element, index, array) {
      var device = element;

      var deviceWrapper = document.createElement('div');
      deviceWrapper.className = 'row';

      // add device alias/name
      var titleWrapper = document.createElement('span');
      titleWrapper.innerHTML = device.name;
      titleWrapper.className = 'device';
      deviceWrapper.appendChild(titleWrapper);

      // add readings
      device.values.forEach(function(elementValue, indexValue, arrayValue) {

	var value = elementValue;

	if (typeof elementValue == "number") {
        	value = parseFloat(elementValue).toFixed(1);
	}

        var valueWrapper = document.createElement('span');

        //add icon
        if (self.config.devices[index].deviceReadings[indexValue].icon) {
          valueWrapper.innerHTML = '<i class="dimmed ' + self.config.devices[index].deviceReadings[indexValue].icon + '"></i>';
        }

        valueWrapper.innerHTML += value;

        // add suffix
        if (self.config.devices[index].deviceReadings[indexValue].suffix) 
        {
          valueWrapper.innerHTML += self.config.devices[index].deviceReadings[indexValue].suffix;
        }

        if (self.config.devices[index].deviceReadings[indexValue].notification)
        {
	  self.sendNotification(self.config.devices[index].deviceReadings[indexValue].notification, elementValue);
        }

        valueWrapper.className = 'value medium bright';
        deviceWrapper.appendChild(valueWrapper);
      });

      container.appendChild(deviceWrapper);
    });

    }

    return container;
  }

});
