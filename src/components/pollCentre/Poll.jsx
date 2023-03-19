import React, {useState} from "react";
import {Card, Col, Form, InputGroup, Button, Row} from "react-bootstrap";

const Poll = ({address, title, options, appId, votes, onOptionSelect, showResults, showResultsFlag}) => {

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
        showResults(appId);
    };

    return (
        <Col>
            <Card className="h-100">
                <Card.Header>
                    <Card.Title>{title}</Card.Title>
                </Card.Header>
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

export default Poll;