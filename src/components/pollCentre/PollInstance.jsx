import React, {useState} from "react";
import {Card, Col, Form, InputGroup, Button, Row} from "react-bootstrap";
import { RadioButton } from 'primereact/radiobutton';

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

    const handleResults = (event) => {
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
                    {showResultsFlag && (
                        <Form.Label> - {votes[option]}</Form.Label>
                    )}
                     <div className="col sm">
                        <div role="progressbar" className="p-progressbar p-component p-progressbar-determinate" aria-valuemin="0" aria-valuenow="63" aria-valuemax="100">
                            <div className="progress-bar p-progressbar-value p-progressbar-value-animate"></div>
                        </div>
                    </div>
                </InputGroup>
            ))}
            
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