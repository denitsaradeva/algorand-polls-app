import React, {useState} from "react";
import {Card, Col, Form, InputGroup, Button, Row} from "react-bootstrap";

const PollInstance = ({address, options, endTime, appId, votes, onOptionSelect, showResults, showResultsFlag}) => {

    const [selectedOption, setSelectedOption] = useState('');

    const handleChange = (event) => {
        const value = event.target.value;
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

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
        return formattedDate;
      }

    return (
        <Col>
            <Card className="h-100">
                <Card.Header>End Time: {formatDate(endTime)}</Card.Header>
                <Card.Body className="d-flex flex-column text-center">
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
                        </InputGroup>
                    ))}
                </Card.Body>
                <Card.Footer>
                
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
                </Row>
                </Card.Footer>
            </Card>
        </Col>
    );
};

export default PollInstance;