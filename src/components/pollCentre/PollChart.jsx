import React, {useState, useEffect} from "react";
import { Chart } from 'primereact/chart';
        
const PollChart = ({votes, options}) => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        setData();
    }, [votes]);

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
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                      ],
                      borderColor: [
                        'rgb(255, 159, 64)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)'
                      ],
                      borderWidth: 1
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


    return (
        <div className="col sm card1">
            <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
    );
};

export default PollChart;