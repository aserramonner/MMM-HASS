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
    hassiotoken: false, // True: OAuth bearer token for API is in environment variable HASSIO_TOKEN (useful when running as a hassio add-on)
  },

  // Define required scripts.
  getStyles: function() {
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
      this.hassData = payload;
      this.loaded = true;
      this.updateDom(2000);
    }
  },

  // Method is called when all modules are loaded an the system is ready to boot up
  start: function() {
    Log.info('Starting module: ' + this.name);
    this.loaded = false;
    this.hassData = [];
    this.getData();
    var self = this;
    setInterval(function() {
      self.getData()
    }, this.config.updateInterval);
  },

  roundValue: function(value) {
    var decimals = 1;
    return parseFloat(value)
      .toFixed(decimals);
  },

  getData: function() {
    this.sendSocketNotification('GETDATA', this.config);
  },

  /* scheduleUpdate()
   * Schedule next update.
   *
   * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
   */
  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== 'undefined' && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    setInterval(function() {
      self.sendSocketNotification('GETDATA', self.config)
    }, nextLoad);
  },

  // Update the information on screen
  getDom: function() {
    var self      = this;
    var container = document.createElement('div');

    if (!this.loaded) {
      var loading = document.createElement('div');
      loading.className = 'device';
      loading.innerHTML = this.translate("LOADING");
      container.appendChild(loading);
    } else {

      for(var index = 0, numDevices = self.config.devices.length; index<numDevices; index++) {
        var device   = self.config.devices[index];
        var hassData = this.hassData[device.deviceLabel];

        var deviceWrapper = document.createElement('div');
        deviceWrapper.className = 'row';

        // add device alias/name
        var titleWrapper = document.createElement('span');
        titleWrapper.innerHTML = device.deviceLabel;
        titleWrapper.className = 'device';
        deviceWrapper.appendChild(titleWrapper);

        // add readings but do not rely on order from requests
        for(var indexValue=0, numReadings=device.deviceReadings.length; indexValue<numReadings; indexValue++) {

		  var value = hassData[self.config.devices[index].deviceReadings[indexValue].sensor];

		  if (typeof value == "number") {
		    value = parseFloat(value)
		      .toFixed(1);
		  }

		  var valueWrapper = document.createElement('span');

		  //add icon
		  if (self.config.devices[index].deviceReadings[indexValue].icon) {
		    valueWrapper.innerHTML = '<i class="dimmed ' + self.config.devices[index].deviceReadings[indexValue].icon + '"></i>';
		  }

		  // add prefix
		  if (self.config.devices[index].deviceReadings[indexValue].prefix) {
		    valueWrapper.innerHTML += self.config.devices[index].deviceReadings[indexValue].prefix;
		  }

		  valueWrapper.innerHTML += value;

		  // add suffix
		  if (self.config.devices[index].deviceReadings[indexValue].suffix) {
		    valueWrapper.innerHTML += self.config.devices[index].deviceReadings[indexValue].suffix;
		  }

		  if (self.config.devices[index].deviceReadings[indexValue].notification) {
		    self.sendNotification(self.config.devices[index].deviceReadings[indexValue].notification, value);
		  }

		  valueWrapper.className = 'value medium bright';
		  deviceWrapper.appendChild(valueWrapper);
		}

		container.appendChild(deviceWrapper);
	      }

	    }

	    return container;
	  }

	});
