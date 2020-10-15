import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import { withStyles } from '@material-ui/core/styles';

import electionsConfig from '../electionsConfig'

import ParlamentChart from '../components/ParlamentChart'
import { Typography } from '@material-ui/core';

import matchParty, {matchPartyForMap} from '../util/partyMathching'

import * as d3 from 'd3'

import CutoffSlider from './CutoffSlider'

import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';

//import { d3 } from "d3-scale-chromatic";

const styles = theme => ({
    header: {
        [theme.breakpoints.down('sm')]: {
            width: '100%',
          },
        [theme.breakpoints.up('sm')]: {
        width: '70%',
        },
        [theme.breakpoints.up('md')]: {
        width: '50%',
        },
    },
    redLine: {
        content:'',
        position:"absolute",
        borderBottom:"solid 1px",
        top:"50%",
        color: "red",
        justifyContent: "center",
        [theme.breakpoints.down('sm')]: {
            width: '100%',
          },
        [theme.breakpoints.up('sm')]: {
        width: '80%',
        },
        [theme.breakpoints.up('md')]: {
        width: '70%',
        },
    }
  });

class Parties extends React.Component {

    constructor(props) {
        super(props);

        let defaultState = {}

        defaultState.percentsLeft=100
        defaultState.againstAllReached = false
        defaultState.onlyOnePartyPassed = false     

        let parties = {}
        electionsConfig.parties.map((value) => {

            let partyInfo = {}

            partyInfo.voteResult = 0
            partyInfo.parlamentResultChairs = 0
            partyInfo.parlamentResultPercents = 0
            partyInfo.residual = 0
            partyInfo.message = ''

            parties[value]=partyInfo
        })

        defaultState.parties = parties

        this.state = defaultState;

        this.cutoff = electionsConfig.cutoff
        this.switchBirimdik = true
        this.switchMekenim = true
        this.switchKyrgyzstan = true
      }    


    componentDidMount() {         
        //Костыль
        if(this.state.parties['Биримдик'].voteResult == 0){
            this.loadElectionsResultsData() 
        }                       
    }

    loadElectionsResultsData = () => {
        d3.csv(require('../data/PARTIES_RESULTS_REACT.csv')).then(data => {
            data.forEach(function(d) {
                d.form2_percent = parseFloat(d.form2_percent)
                d.total = parseFloat(d.total)
                //d.uic_number= parseFloat(d.uic_number)
                d['«АТА МЕКЕН» саясий социалисттик партиясы'] = parseFloat(d['«АТА МЕКЕН» саясий социалисттик партиясы'])
                d['«АФГАНИСТАН СОГУШУНУН АРДАГЕРЛЕРИ ЖАНА УШУЛ СЫЯКТУУ КАГЫШУУЛАРГА КАТЫШКАНДАРДЫН САЯСИЙ ПАРТИЯСЫ»'] = parseFloat(d['«АФГАНИСТАН СОГУШУНУН АРДАГЕРЛЕРИ ЖАНА УШУЛ СЫЯКТУУ КАГЫШУУЛАРГА КАТЫШКАНДАРДЫН САЯСИЙ ПАРТИЯСЫ»'])
                d['«БИР БОЛ»'] = parseFloat(d['«БИР БОЛ»']) 
                d['«БИРИМДИК»'] = parseFloat(d['«БИРИМДИК»'])
                d['«БҮТҮН КЫРГЫЗСТАН» саясий партиясы'] = parseFloat(d['«БҮТҮН КЫРГЫЗСТАН» саясий партиясы'])
                d['«ЗАМАНДАШ»'] = parseFloat(d['«ЗАМАНДАШ»'])
                d['«КЫРГЫЗСТАН»'] = parseFloat(d['«КЫРГЫЗСТАН»'])
                d['«МЕКЕН ЫНТЫМАГЫ»'] = parseFloat(d['«МЕКЕН ЫНТЫМАГЫ»'])
                d['«МЕКЕНИМ КЫРГЫЗСТАН»'] = parseFloat(d['«МЕКЕНИМ КЫРГЫЗСТАН»'])
                d['«МЕКЕНЧИЛ»'] = parseFloat(d['«МЕКЕНЧИЛ»'])
                d['«ОРДО»'] = parseFloat(d['«ОРДО»'])
                d['«РЕФОРМА» партиясы'] = parseFloat(d['«РЕФОРМА» партиясы'])
                d['«ЧОҢ КАЗАТ»'] = parseFloat(d['«ЧОҢ КАЗАТ»'])
                d['«ЫЙМАН НУРУ»'] = parseFloat(d['«ЫЙМАН НУРУ»'])
                d['БААРЫНА КАРШЫ'] =  parseFloat(d['БААРЫНА КАРШЫ'])
                d['РЕСПУБЛИКА'] = parseFloat(d['РЕСПУБЛИКА'])
                d['СОЦИАЛ-ДЕМОКРАТТАР'] = parseFloat(d['СОЦИАЛ-ДЕМОКРАТТАР'])
                });

            return data                 
            
            }).then((resultsData) => {

            if(typeof(resultsData) !== undefined){

                let resultsSummary = {}

                resultsData.forEach(result => {
                    Object.keys(result).map((key) => {

                        if (resultsSummary.hasOwnProperty(key)){
                            resultsSummary[key] += result[key]
                        }else{
                            resultsSummary[key] = result[key]
                        }            
                    })  

                }) 
                
                const parties = {...this.state.parties}

                Object.keys(resultsSummary).map((key) => {

                    if (parties.hasOwnProperty(matchParty([key]))){

                        parties[matchParty([key])].voteResult = resultsSummary[key] / resultsSummary.total * 100   
                        
                    }  
                })  

                this.setState( {parties: parties} )


                console.log('FIND BUG')
                console.log(parties)

                //Percents left
                this.calculateResults()                
            }                  
        });                      
    }

    voteNumberOnChange = (event) => {

        const party = event.target.id
        const parties = {...this.state.parties}  
        parties[party].voteResult = Number(event.target.value)

        this.setState( {parties: parties} )

        //Percents left
        this.calculateResults()
    }

    sortProperties(obj, sortedBy, isNumericSort, reverse) {
        sortedBy = sortedBy || 1; // by default first key
        isNumericSort = isNumericSort || false; // by default text sort
        reverse = reverse || false; // by default no reverse

        var reversed = (reverse) ? -1 : 1;

        var sortable = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                sortable.push([key, obj[key]]);
            }
        }
        if (isNumericSort)
            sortable.sort(function (a, b) {
                return reversed * (a[1][sortedBy] - b[1][sortedBy]);
            });
        else
            sortable.sort(function (a, b) {
                var x = a[1][sortedBy],
                    y = b[1][sortedBy];
                return x < y ? reversed * -1 : x > y ? reversed : 0;
            });
        return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
    }

    checkPartySwitch = (party) => {
        if(party == 'Биримдик'){
            return this.switchBirimdik
        }

        if(party == 'Мекеним Кыргызстан'){
            return this.switchMekenim            
        }

        if(party == 'Кыргызстан'){
            return this.switchKyrgyzstan          
        }

        return true
    }

    calculateResults = () => {

        console.log('CALC')
        console.log(this.cutoff)

        let percentSum = 0
        let totalPassedParlamentPercent = 0
        let totalChairs = 0 

        Object.keys(this.state.parties).map((party) => {

            let voteResult = this.state.parties[party].voteResult
            percentSum = percentSum + voteResult

            if (voteResult >= this.cutoff && party != 'Против всех' && this.checkPartySwitch(party)){
                totalPassedParlamentPercent = totalPassedParlamentPercent + voteResult     
            }

         })     
         
        let percentsLeft = Number(100 - percentSum).toFixed(2)
        this.setState( {percentsLeft: percentsLeft} )

        const parties = {...this.state.parties} 

        if (percentsLeft == 0) {                     

            Object.keys(this.state.parties).map((party) => {
    
                let voteResult = this.state.parties[party].voteResult    

                let parlamentResultPercents = 0  
                let parlamentResultChairsFloat = 0
                let parlamentResultChairs = 0 
                let message = this.cutoff_message + ' ' + this.cutoff + '%'

                if (voteResult >= this.cutoff && party != 'Против всех' && this.checkPartySwitch(party)){
                    parlamentResultPercents = voteResult * 100 / totalPassedParlamentPercent  
                    parlamentResultChairsFloat = electionsConfig.totalChairs * parlamentResultPercents / 100 
                    parlamentResultChairs = Math.floor(electionsConfig.totalChairs * parlamentResultPercents / 100)
                    message = ''
                } 

                parties[party].parlamentResultPercents = parlamentResultPercents
                parties[party].parlamentResultChairs = parlamentResultChairs
                parties[party].residual = (parlamentResultChairsFloat - parlamentResultChairs).toFixed(2)
                parties[party].message = message

                totalChairs = totalChairs + parlamentResultChairs
            })  
            
            //Распределить мандаты если остались после первичного распределения
            if (totalChairs != electionsConfig.totalChairs){

                let sortedParties = this.sortProperties(parties, 'residual', true, true)

                let distributeLeft = electionsConfig.totalChairs - totalChairs

                sortedParties.forEach(function (item) {
                    console.log(item[0]);

                    if (distributeLeft > 0){
                        parties[item[0]].parlamentResultChairs += 1 
                        distributeLeft -= 1
                    }
                  });
            }

            //Если одна партия набирает больше 65 голосов
            let monopolyParty = ''
            let isMonopoly = false
            let monopolyChairs = 0
            let monopolyPercent = 0
            
            Object.keys(this.state.parties).map((party) => {
                if (parties[party].parlamentResultChairs > electionsConfig.maxChairsForParty) {
                    isMonopoly = true
                    monopolyParty = party
                    monopolyChairs = parties[party].parlamentResultChairs
                    monopolyPercent = parties[party].voteResult 
                }

            })

            if (isMonopoly){

                totalChairs = 0
                Object.keys(this.state.parties).map((party) => {
    
                    let voteResult = parties[party].voteResult    
    
                    if (voteResult >= this.cutoff && party != 'Против всех' && this.checkPartySwitch(party)){
                        if (party == monopolyParty){
                            parties[party].parlamentResultChairs = electionsConfig.maxChairsForParty
                        }else{  
                            // console.log("START MONOPOLY")               
                            // console.log(monopolyChairs)     
                            // console.log(monopolyPercent) 
                            // console.log(voteResult)     
                            
                            let parlamentResultPercents = voteResult * 100 / (totalPassedParlamentPercent - monopolyPercent)  

                            console.log(Math.floor((monopolyChairs-electionsConfig.maxChairsForParty) * parlamentResultPercents / 100))  
                            parties[party].parlamentResultChairs += Math.floor((monopolyChairs-electionsConfig.maxChairsForParty) * parlamentResultPercents / 100)
                        }

                        totalChairs = totalChairs + parties[party].parlamentResultChairs
                    }    
                })  
                
                 //Распределить мандаты если остались после первичного распределения (если Монополия)
                if (totalChairs != electionsConfig.totalChairs){

                    let sortedParties = this.sortProperties(parties, 'residual', true, true)

                    let distributeLeft = electionsConfig.totalChairs - totalChairs

                    sortedParties.forEach(function (item) {
                        console.log(item[0]);

                        if (distributeLeft > 0){
                            if (item[0] != monopolyParty){
                                parties[item[0]].parlamentResultChairs += 1 
                                distributeLeft -= 1
                            }                            
                        }
                    });
                }

                //Проверить если одна только партия прошла барьер
                let passCounter = 0   
                let onlyOnePartyPassed = false             
                Object.keys(this.state.parties).map((party) => {
                    
                    let voteResult = parties[party].voteResult  

                    if (voteResult >= this.cutoff && this.checkPartySwitch(party)){
                        passCounter += 1 
                    }                    
                })

                if (passCounter < 2){

                    onlyOnePartyPassed = true    
                    Object.keys(this.state.parties).map((party) => {
                        parties[party].parlamentResultChairs = 0
                    })   

                    this.setState( {onlyOnePartyPassed: onlyOnePartyPassed} )
                }
            }

        } else {
            
            Object.keys(this.state.parties).map((party) => {

                //parties[party].parlamentResultPercents = 0
                parties[party].parlamentResultChairs = 0
                parties[party].residual = 0
                parties[party].message = ''
            })             
        }  

        //Против всех
        if (parties['Против всех'].voteResult < electionsConfig.against_all_cutoff)  {

            if ((percentsLeft == 0) && (parties['Против всех'].voteResult > 0)){
                parties['Против всех'].message = electionsConfig.against_all_message                    
            }else {
                parties['Против всех'].message = ''
            }
            this.setState( {againstAllReached: false} )
            
        } else {
            parties['Против всех'].message = ''
            this.setState( {againstAllReached: true} )
        }
        
        this.setState( {parties: parties} )
    }

    prepareChartData = () => {

        let chartData = []
        //var colours = d3.scaleOrdinal(d3.schemeCategory10)
	    //.domain(["foo", "bar", "baz", "foobar"]);
  
        //console.log(colours("foobar"))

        let listOfColors = ['#ff4000','#ff8000','#ffbf00','#ffff00','#bfff00','#80ff00','#40ff00','#00ff00','#00ff40','#00ff80','#00ffbf','#00ffff','#00bfff','#0080ff','#0040ff','#0000ff','#4000ff','#8000ff','#bf00ff','#ff00ff','#ff00bf','#ff0080','#ff0040','#ff0000']

        Object.keys(this.state.parties).map((party) => {

            
            let chairsNumber = this.state.parties[party].parlamentResultChairs

            if (Number(chairsNumber) > 0) {

                let colorIndex = Math.floor(Math.random() * listOfColors.length)
                let randomColor = listOfColors[colorIndex]
                listOfColors.splice(colorIndex, 1);

                let partyChartInfo = [party, parseInt(chairsNumber), , party]
                chartData.push(partyChartInfo)              
            } 
                        
        })    
        console.log(chartData)
        //chartData = [['TEST', 25, '#ffbf00', 'TEST'], ['TEST', 25, '#ffbf00', 'TEST'], ['TEST', 25, '#ffbf00', 'TEST'], ['TEST', 25, '#ffbf00', 'TEST']]
        return chartData
    }

    setCutoff = (event, value) => {
        //console.log(event.target.ariaValueNow)
        console.log('EVENT')
        console.log(event)

        if(this.cutoff != value){
            this.cutoff = value
            this.calculateResults()
        }

 
    }

    handleChange = (event) => { 
        this[event.target.name] = event.target.checked
        this.calculateResults()
      };


    render() {

        console.log(this.state)

        const isAgainstAllReached = this.state.againstAllReached;
        const onlyOnePartyPassed = this.state.onlyOnePartyPassed;
        const { classes } = this.props;

        //console.log(this.prepareChartData())
        return (
            <div>                

                <Grid container justify="center">
                    <Grid item className={classes.header}>
                        <Typography variant="h5">Измените избирательный порог и Вы увидите как распределяются места в парламенте с учетом нового избирательного порога</Typography>
                    </Grid>
                </Grid>

                <Grid container justify="center">
                    <CutoffSlider cutoffOnChange={this.setCutoff}></CutoffSlider>
                </Grid>

                <FormControl component="fieldset">
                    <FormLabel component="legend">Исключить нижеследующие партии из расчетов при распределении мест?</FormLabel>
                        <FormGroup>
                        <FormControlLabel
                            control={
                            <Switch
                                checked={this.switchBirimdik}
                                onChange={this.handleChange}
                                name="switchBirimdik"
                                color="Secondary"
                            />
                            }
                            label="Биримдик"
                        />
                        <FormControlLabel
                            control={
                            <Switch
                                checked={this.switchMekenim}
                                onChange={this.handleChange}
                                name="switchMekenim"
                                color="Secondary"
                            />
                            }
                            label="Мекеним Кыргызстан"
                        />

                        <FormControlLabel
                            control={
                            <Switch
                                checked={this.switchKyrgyzstan}
                                onChange={this.handleChange}
                                name="switchKyrgyzstan"
                                color="Secondary"
                            />
                            }
                            label="Кыргызстан"
                        />
                        </FormGroup>
                    </FormControl>

                <div>
                    {this.state.percentsLeft == 0
                        ? <ParlamentChart>chartData={this.prepareChartData()}</ParlamentChart>
                        : <b>Для отображения графика распределения мест необходимо полностью распределить проценты голосов</b>
                    }
                </div>

                {/* <Typography variant="body1">Осталось распределить: {this.state.percentsLeft}</Typography>                 */}

                <b>{isAgainstAllReached ? electionsConfig.against_all_reached_message : ''}</b>

                <b>{onlyOnePartyPassed ? electionsConfig.one_party_cutoff_only_message : ''}</b>

                <List dense className={'Parties'}>
                {electionsConfig.parties.map((value) => {
                    const labelId = `label-${value}`;
                    const disabled = this.state.parties[value].message ? true : false
                    return (
                    <Tooltip TransitionComponent={Zoom} title={disabled ? this.state.parties[value].message : "" } arrow>
                    <ListItem key={value} style={{justifyContent: "center"}} disabled={disabled}>
                        {disabled ? <Grid item className={classes.redLine}></Grid> : null}
                        <Grid item>
                            <ListItemAvatar>
                            <Avatar
                                //alt={`Avatar n°${value}`}
                                src={require("./PartyLogo/" + value + ".png")}
                                variant="square"
                            />
                            </ListItemAvatar>
                        </Grid>
                        <Grid item xs={5}>
                            <ListItemText id={labelId} primary={value} />
                        </Grid>
                        
                        <Grid style={{width: 90, paddingRight: 5}}>
                        <TextField  
                            id={value} 
                            value={this.state.parties[value].voteResult.toFixed(2)}
                            disabled={true}
                            type ='number'                            
                            onChange={this.voteNumberOnChange}
                            label="Процент голосов" 
                            variant="outlined"
                            fullWidth
                            inputProps={{style: {fontSize: 14, color: "black", fontWeight: 'bold'}}}
                            InputLabelProps={{style: {fontSize: 14}}}
                            />
                            
                        </Grid>

                        <Grid style={{width: 80}}>
                        <TextField  
                            id={value} 
                            value={this.state.parties[value].parlamentResultChairs}
                            disabled={true}
                            onChange={this.voteNumberOnChange}
                            label="Мест в парламенте" 
                            variant="outlined"
                            fullWidth
                            inputProps={{style: {fontSize: 14, color: "green", fontWeight: 'bold'}}}
                            InputLabelProps={{style: {fontSize: 14}}}
                            /> 
                        </Grid>

                        {/* <div>{this.state.parties[value].message}</div> */}
                    </ListItem>
                    </Tooltip>
                    );
                })}
                </List>              
                              
            </div>
          );
        }
    }    

export default withStyles(styles, { withTheme: true })(Parties)