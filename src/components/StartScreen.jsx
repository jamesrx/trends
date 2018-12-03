import React from 'react';
import Lobby from './Lobby';
import Room from './Room';

const StartScreen = (props) => {
  return (
    <div id="startscreen">
      {
        props.state.room
          ? <Room
              socket={props.socket}
              state={props.state}
              updateGameState={props.updateGameState}
              updateRooms={props.updateRooms}
              setNumRounds={props.setNumRounds}
            />
          : <Lobby
              socket={props.socket}
              state={props.state}
              updateGameState={props.updateGameState}
              updateRooms={props.updateRooms}
            />
        }
    </div>
  );
}

export default StartScreen;
