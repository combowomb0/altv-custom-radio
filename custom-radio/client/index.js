import * as alt from 'alt-client';
import native from 'natives';

const CUSTOM_STATIONS = [
  {
    name: 'RADIO_01_CLASS_ROCK',
    url: 'http://listen.011fm.com:9000/stream05',
    title: '[Custom] Big 80s',
  },
  {
    name: 'RADIO_02_POP',
    url: 'http://listen.vdfm.ru:8000/shanson',
    title: '[Custom] Shanson Volgodonsk',
  },
];

const view = {
  instance: null,
  isLoaded: false,
};

const getCurrentVolume = () => native.getProfileSetting(306) / 50;

let tickerId = undefined;

const radio = {
  previousVolume: getCurrentVolume(),
  previousStation: undefined,
  isPlaying: false,
};

alt.on('connectionComplete', () => {
  view.instance = new alt.WebView('http://resource/client/html/index.html');
  view.instance.on('radio:loaded', () => {
    view.isLoaded = true;
    view.instance.emit('radio:changeVolume', radio.previousVolume);
  });

  CUSTOM_STATIONS.forEach((station) => {
    alt.addGxtText(station.name, station.title);
  });
});

const stopRadio = () => {
  if (radio.isPlaying) {
    native.setFrontendRadioActive(true);
    radio.isPlaying = false;
    view.instance.emit('radio:stop');
  }
};

const initHandler = () => {
  const ped = alt.Player.local.scriptID;

  if (!view.isLoaded || !native.isPedSittingInAnyVehicle(ped)) {
    return;
  }

  const vehicle = native.getVehiclePedIsIn(ped, false);
  const engineState = native.getIsVehicleEngineRunning(vehicle);

  if (engineState) {
    const stationName = native.getPlayerRadioStationName();
    const customStation = CUSTOM_STATIONS.find((station) => station.name === stationName);

    if (customStation && (!radio.isPlaying || customStation.name !== radio.previousStation)) {
      native.setFrontendRadioActive(false);
      radio.previousStation = customStation.name;
      radio.isPlaying = true;
      view.instance.emit('radio:play', customStation.url);
    }

    if (!customStation && radio.isPlaying) {
      stopRadio();
    }
  } else if (radio.isPlaying) {
    stopRadio();
  }

  const currentVolume = getCurrentVolume();

  if (currentVolume !== radio.previousVolume) {
    radio.previousVolume = currentVolume;
    view.instance.emit('radio:changeVolume', currentVolume);
  }
};

const removeHandler = () => {
  if (tickerId !== undefined) {
    alt.clearEveryTick(tickerId);
  }

  stopRadio();
};

alt.onServer('radio:enteredVehicle', () => {
  removeHandler();
  tickerId = alt.everyTick(initHandler);
});

alt.onServer('radio:leftVehicle', removeHandler);
