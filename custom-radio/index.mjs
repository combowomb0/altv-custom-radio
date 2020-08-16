import * as alt from 'alt-server';

alt.on('playerEnteredVehicle', (player) => {
  alt.emitClient(player, 'radio:enteredVehicle');
});

alt.on('playerLeftVehicle', (player) => {
  alt.emitClient(player, 'radio:leftVehicle');
});
