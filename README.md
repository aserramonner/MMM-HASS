# MMM-HASS
HomeAssistant module for the MagicMirror. Shows sensor readings from HomeAssistant: 

![ScreenShot](/MMM-HASS.png)

## Dependencies
- An installation of [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror)
- [request](https://www.npmjs.com/package/request)
- [underscore](https://www.npmjs.com/package/underscore)

## Installation
Navigate into your MagicMirror's `modules` folder:
```
cd ~/MagicMirror/modules
```

Clone this repository:
```
git clone https://github.com/aserramonner/MMM-HASS
```

Navigate to the new `MMM-HASS` folder and install the node dependencies.
```
npm install
```

Configure the module in your `config.js` file.

## Using the module
To use this module, add it to the modules array in the `config/config.js` file:
```javascript
{
        module: "MMM-HASS",
        position: "top_left",
        config: {
                host: "your_home_assistant_ip",
                port: "your_home_assistant_port",
                apipassword: "your_home_assistant_api_password",
                https: false,
                devices: [
                { deviceLabel: "Exterior",
                        deviceReadings: [
                        { sensor: "sensor.netatmo_outdoor_temperature", icon: "wi wi-thermometer", suffix: "°"},
                        { sensor: "sensor.netatmo_outdoor_humidity", icon: "wi wi-humidity", suffix: "%"},
                        { sensor: "sensor.netatmo_outdoor_battery", icon: "fa fa-battery-full", suffix: ""}
                        ]
                },
                { deviceLabel: "Menjador",
                        deviceReadings: [
                        { sensor: "sensor.netatmo_indoor_temperature", icon: "wi wi-thermometer", suffix: "°", notification: "INDOOR_TEMPERATURE"},
                        { sensor: "sensor.netatmo_indoor_humidity", icon: "wi wi-humidity", suffix: "%"},
                        { sensor: "sensor.netatmo_indoor_co2", icon: "fa fa-leaf", suffix: ""}
                        ]
                },
                { deviceLabel: "Telèfon",
                        deviceReadings: [
                        { sensor: "sensor.voip_status", icon: "fa fa-heart", suffix: ""},
                        { sensor: "sensor.voip_lostcalls", icon: "fa fa-phone", suffix: ""}
                        ]
                }
                ]
          }
}
```
