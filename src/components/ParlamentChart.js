import React from 'react'

import * as Highcharts from 'highcharts';
import ItemSeriesModule from 'highcharts/modules/item-series';
import HighchartsReact from 'highcharts-react-official'

ItemSeriesModule(Highcharts);

const generateChartData = (chartData) => {

    console.log('DRAW CHART')
    const options = {

        chart: {
            type: 'item'
        },
    
        title: {
            text: 'Распределение мест в парламенте'
        },
    
        subtitle: {
            text: 'Жогорку Кенеш'
        },
    
        legend: {
            labelFormat: '{name} <span style="opacity: 0.4">{y}</span>'
        },
    
        series: [{
            name: 'Депутатов',
            keys: ['name', 'y', 'color', 'label'],
            data: chartData,
            dataLabels: {
                enabled: true,
                format: '{point.label}'
            },
    
            // Circular options
            center: ['50%', '88%'],
            size: '170%',
            startAngle: -100,
            endAngle: 100
        }]
    }

    return options
}

const ParlamentChart = (props) => <HighchartsReact
  highcharts={Highcharts}
  constructorType={'chart'}
  options={generateChartData(props.children[1])}
/>

const areEqual = (prevProps, nextProps) => {
    return (prevProps.children[1] === nextProps.children[1])
    }

export default React.memo(ParlamentChart, areEqual);
  
//export default ParlamentChart