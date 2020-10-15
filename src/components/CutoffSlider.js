import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

const muiTheme = createMuiTheme({
  overrides:{
    MuiSlider: {
      thumb:{
      color: "red",
      },
      track: {
        color: 'blue'
      },
      rail: {
        color: 'black'
      }
    }
}
});

const useStyles = makeStyles((theme) => ({
  root: {
    width: 400,
  },
  margin: {
    height: theme.spacing(3),
  },
}));

const marks = [
  {
    value: 0,
    label: '0%',
  },
  {
    value: 1
  },
  {
    value: 2
  },
  {
    value: 3,
    label: '3%',
  },
  {
    value: 4
  },
  {
    value: 5,
    label: '5%',
  },
  {
    value: 6
  },
  {
    value: 7,
    label: '7%',
  },
];

const valuetext = (value) => {
  
  return `${value}°C`;
}

export default function CutoffSlider(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography id="discrete-slider-always" gutterBottom>
         Избирательный порог (%)
      </Typography>
      <ThemeProvider theme={muiTheme}>
      <Slider
        defaultValue={7}
        getAriaValueText={valuetext}
        onChange={props.cutoffOnChange}
        aria-labelledby="discrete-slider-always"
        step={1}
        marks={marks}
        valueLabelDisplay="on"
        min={0}
        max={7}
      />
      </ThemeProvider>
    </div>
  );
}

