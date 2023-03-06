import React, {useState} from "react";
import {Card, Col, Form, InputGroup, Button} from "react-bootstrap";

const Poll = ({address, title, options, appId, votes, onOptionSelect}) => {

    const [selectedOption, setSelectedOption] = useState('');

    const handleChange = (event) => {
        const value = event.target.value;
        setSelectedOption(value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onOptionSelect(selectedOption, appId);
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
                        />
                        <Form.Label>{option} - {votes[option]}</Form.Label>
                    </InputGroup>
                ))}
                </Card.Body>
                <Card.Footer>
                <Form onSubmit={handleSubmit}>
                    <Button variant="primary" type="submit">
                        Vote
                    </Button>
                </Form>
                </Card.Footer>
            </Card>
        </Col>
    );
};

export default Poll;