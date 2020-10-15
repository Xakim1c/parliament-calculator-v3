import React from 'react';
import logo from './logo.svg';
import './App.css';

import electionsConfig from './electionsConfig'
import Parties from './components/Parties'
import { Grid, Typography } from '@material-ui/core';

function App() {	
	
  return (
    <div className="App">

      {/* <Typography variant="h6">{electionsConfig.distribute_all_votes_message}</Typography> */}
      <Parties></Parties>
	
    </div>
  );
}

export default App;
