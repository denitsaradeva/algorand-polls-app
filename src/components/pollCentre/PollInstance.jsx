import React, {useState} from "react";
import {Card, Col, Form, InputGroup, Button, Row} from "react-bootstrap";
import { RadioButton } from 'primereact/radiobutton';
import { Chart } from 'primereact/chart';
import PollChart from "./PollChart"
        

const PollInstance = ({address, options, endTime, appId, votes, onOptionSelect, showResults, showResultsFlag, optIn}) => {

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

    const handleResults = async (event) => {
        event.preventDefault();
        showResults(endTime, appId);
    };

    const handleOptIn = (event) => {
        event.preventDefault();
        optIn(appId);
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