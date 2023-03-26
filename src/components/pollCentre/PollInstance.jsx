import React, {useState} from "react";
import {Card, Col, Form, InputGroup, Button, Row} from "react-bootstrap";
import { RadioButton } from 'primereact/radiobutton';
import { Chart } from 'primereact/chart';
        

const PollInstance = ({address, options, endTime, appId, votes, onOptionSelect, showResults, showResultsFlag, optIn, maxVotes}) => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    const [selectedOption, setSelectedOption] = useState('');

    const handleChange = (event) => {
        const value = event.target.value;
        console.log(value)
        setSelectedOption(value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onOptionSelect(selectedOption, appId);
    };

    const handleResults = (event) => {
        event.preventDefault();
        setData();
        showResults(endTime, appId);
    };

    const handleOptIn = (event) => {
        event.preventDefault();
        optIn(appId);
    };

    const setData = () => {
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

        return true;
    }

    // const getMaxVotes = () => {
    //     return `${maxVotes}`;
    // }

    return (
        <div> 
            {options.map((option) => (
                <InputGroup key={option}>
                    <InputGroup.Radio
                        name="radioOptions"
                        aria-label={option}
                        value={option}
                        checked={selectedOption === option}
                        onChange={handleChange}
                    />  {option}
                    {/* {showResultsFlag && (
                        <div className="col sm card1">
                            <ProgressBar displayValueTemplate={(value) => `${value}`} value={votes[option]/ (maxVotes - 0)}></ProgressBar>
                        </div>
                     )} */}
                </InputGroup>
            ))}
            
            <br></br>

            {showResultsFlag && (
                <div className="col sm card1">
                    <Chart type="bar" data={chartData} options={chartOptions} />
                </div>
            )}

            <br></br>
  
            <Row className="align-items-center">
                <Col xs="auto">
                    <Form onSubmit={handleSubmit}>
                        <Button variant="secondary" type="submit" className="btn btn-dark">
                            Vote
                        </Button>
                    </Form>
                </Col>
                <Col xs="auto">
                    <Form onSubmit={handleOptIn}>
                        <Button variant="secondary" type="submit" className="btn btn-dark">
                            Opt In
                        </Button>
                    </Form>
                </Col>
                <Col xs="auto">
                    <Form onSubmit={handleResults}>
                        <Button variant="secondary" type="submit" className="btn btn-dark">
                            Results
                        </Button>
                    </Form>
                </Col>
            </Row>
        </div>
    );
};

export default PollInstance;