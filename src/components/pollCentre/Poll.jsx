import React, {useState} from "react";
import {Card, Col, Form, InputGroup} from "react-bootstrap";

const Poll = ({address, title, options}) => {
    console.log("in poll")
    console.log(options)

    const [selectedOption, setSelectedOption] = useState('');

    const handleChange = (event) => {
        const value = event.target.value;
        setSelectedOption(value);
        // onChange(value);
    };

    return (
        <Col>
            <Card className="h-100">
                <Card.Header>
                    <Card.Title>{title}</Card.Title>
                </Card.Header>
                <Card.Body className="d-flex flex-column text-center">
                    {/* <Form>
                        <Form.Check 
                            type="radio"
                            label={options}
                            name="myRadios"
                            id="option1"
                        />
                    </Form> */}
                {options.map((option) => (
                    <InputGroup key={option}>
                        <InputGroup.Radio
                            name="radioOptions"
                            aria-label={option}
                            value={option}
                            checked={selectedOption === option}
                            onChange={handleChange}
                        />
                        <Form.Label>{option}</Form.Label>
                    </InputGroup>
                ))}
                </Card.Body>
            </Card>
        </Col>
    );
};

export default Poll;