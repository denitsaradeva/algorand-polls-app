import React, {useState, useEffect} from "react";
import { Chart } from 'primereact/chart';
        
const PollChart = ({votes, options}) => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect (() =>{
        const setData = async () => {
            const filteredEntries = Object.entries(votes).filter(([key, value]) => 
                    key !== "VotingChoices" && key !== "Title" && key !== "EndTime" && key !== "Creator"
                );

            const optionVotesMap = {};
            Object.keys(filteredEntries).forEach(key => {
                const option = filteredEntries[key][0];
                const voteCount = filteredEntries[key][1];
                optionVotesMap[option] = voteCount;
            });

            options.forEach(option => {
                if (!optionVotesMap[option]) {
                optionVotesMap[option] = 0;
                }
            });

            const data = {
                labels: Object.keys(optionVotesMap),
                datasets: [
                    {
                        label: 'Votes',
                        data: Object.values(optionVotesMap),
                        backgroundColor: [
                            'rgb(220,20,60)',
                            'rgb(255,215,0)',
                            'rgb(34,139,34)',
                            'rgb(30,144,255)',
                            'rgb(199,21,133)',
                            'rgb(244,164,96)',
                            'rgb(112,128,144)',
                        ]
                    }
                ]
            };
            const optionsChart = {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            };

            setChartData(data);
            setChartOptions(optionsChart);
            console.log('ahd')
        }
        setData();
    }, [votes, options]);


    return (
        <div className="col sm card1">
            <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
    );
};

export default PollChart;