'use strict';

/* Magic Mirror
 * Module: MMM-HASS
 *
 * Simple transposition of Benjamin Roesner´s MMM-FHEM
 * to use it with home assistant
 *
 * GNU GPL v3.0
 */

const NodeHelper = require('node_helper');
var request = require('request');
var _ = require('underscore');

module.exports = NodeHelper.create({
  start: function() {
    this.config = {};
  },

  buildHassUrl: function(devicename, config) {

    var url = config.host;

    if (config.port) {
      url = url + ':' + config.port;
    }

    url = url + '/api/states/' + devicename;

    if (config.apipassword) {
      url = url + '?api_password=' + config.apipassword;
    }

    if(config.debuglogging) {
      console.log(url);
    }

    if (config.https) {
      return 'https://' + url;
    } else {
      return 'http://' + url;
    }
  },

  buildHassEventUrl: function(domain, service, config) {

    var url = config.host;

    if (config.port) {
      url = url + ':' + config.port;
    }

    url = url + '/api/services/' + domain + '/' + service;

    if (config.apipassword) {
      url = url + '?api_password=' + config.apipassword;
    }

    if(config.debuglogging) {
      console.log(url);
    }

    if (config.https) {
      return 'https://' + url;
    } else {
      return 'http://' + url;
    }
  },

  /**
   * use fhem alias as label if it is set
   * @param  {object} device fhem device object
   * @return {string}
   */
  getDeviceName: function(attributes) {
    if (attributes.friendly_name) {
      return attributes.friendly_name;
    } else {
      return attributes.entity_id;
    }
  },

  getReadingsValue: function(readingsName, attributes) {
    var values = [];

    readingsName.forEach(function(element, index, array) {
      var readingName = element;
      if (attributes[readingName]) {
        values.push(attributes[readingName]);
      } else {
        values.push('Reading does not exist');
      }
    });

    return values;
  },

  parseJson: function(index, json) {
    var self = this;

    if(config.debuglogging) {
      console.log(json.attributes);
    }

    var device = {};
    // save value of property 'sensor' an array
    var readings = _.pluck(self.config.devices[index].deviceReadings, function(element, index, list) {
      return
    });

    //console.log(readingsName);
    device.name = config.devices[index].deviceLabel;
    device.values = readings;

    return device;
  },

  sendHassEvent: function(config, domain, service, params) {
    var self = this;

    var urlstr = self.buildHassEventUrl(domain, service, config);

    var post_options = {
      url: urlstr,
      method: 'POST',
      json: params
    };
    if(config.hassiotoken) {
      post_options.headers = { 'Authorization' : 'Bearer ' + process.env.HASSIO_TOKEN };
    }

    var post_req = request(post_options, function(error, response, body) {
      if(config.debuglogging) {
        console.log('Response: ' + response.statusCode);
      }
    });
  },

  getHassReadings: function(config, callback) {
    var self = this;

    //console.log(config.devices);

    var structuredData = _.each(config.devices, function(device) {
      var outDevice = {};

      if(config.debuglogging) {
        console.log(device);
      }

      var readings = device.deviceReadings;
      var urls = [];

      // First, build a list of url for all the readings
      //
      readings.forEach(function(element, index, array) {
        var url = self.buildHassUrl(element.sensor, config);
        console.log('Request URL: ' + url);
        urls.push(url);
      });

      //console.log(urls);

      var completed_requests = 0;

      // Then, get all the json for the device
      //
      var i;
      for (i in urls) {
        var get_options = {
          url: urls[i],
          json: true
        };
        if(config.hassiotoken) {
          get_options.headers = { 'Authorization' : 'Bearer ' + process.env.HASSIO_TOKEN };
        }
        request(get_options, function(error, response, body) {
          completed_requests++;
          if(config.debuglogging) {
            console.log(error);
            console.log(body);
          }
          outDevice[body.entity_id] = body.state;
          if (completed_requests == urls.length) {
            // All requests done for the device, process responses array
            // to retrieve all the states
            outDevice.label = device.deviceLabel;
            console.log(outDevice);
            callback(outDevice);
          }
        });
      }
    });
  },

  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GETDATA') {
      var self = this;
      self.config = payload;
      var structuredData = {};
      var completed_devices = 0;
      this.getHassReadings(this.config, function(device) {
        completed_devices++;
        structuredData[device.label] = device;
        if (completed_devices == self.config.devices.length) {
          self.sendSocketNotification('DATARECEIVED', structuredData);
        }
      });
    } else if (notification === 'HASS_1') {
      var self = this;
      this.sendHassEvent(this.config, 'media_player', 'select_source', {
        'entity_id': 'media_player.menjador',
        'source': 'Tria asm'
      });
    } else if (notification === 'HASS_2') {
      var self = this;
      this.sendHassEvent(this.config, 'switch', 'turn_on', {
        'entity_id': 'switch.cuina'
      });
    }
  }

});
