import React, {useState} from "react";
import {Col, Form, InputGroup, Button, Row} from "react-bootstrap";
import PollChart from "./PollChart"
import { ProgressSpinner } from 'primereact/progressspinner';
        

const PollInstance = ({address, options, endTime, appId, votes, onOptionSelect, showResults, showResultsFlag, isWaiting}) => {

    const [selectedOption, setSelectedOption] = useState('');

    const handleChange = (event) => {
        const value = event.target.value;
        setSelectedOption(value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onOptionSelect(selectedOption, appId);
    };

    const handleResults = async (event) => {
        event.preventDefault();
        showResults(endTime, appId);
    };

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
                </InputGroup>
            ))}
            
            <br></br>

            {showResultsFlag && (
                <PollChart 
                    votes={votes}
                    options={options}
                />
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
                    <Form onSubmit={handleResults}>
                        <Button variant="secondary" type="submit" className="btn btn-dark">
                            Results
                        </Button>
                    </Form>
                </Col>

                <Col xs="auto">
                    {isWaiting &&
                        <div className="flex justify-content-center">
                            <ProgressSpinner  style={{width: '50px', height: '50px'}}/>
                        </div>
                    } 
                </Col>
            </Row>
        </div>
    );
};

export default PollInstance;